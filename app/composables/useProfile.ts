import type { ExtractedProfile, Profile, ProfileUpdate } from '~~/types'
import { computeProfileCompletion } from '~~/lib/profile'

type ProfileResult = { success: boolean; data?: Profile; error?: string; warning?: string }
type SavePhase = 'saving' | 'uploading'
type ExtractResult = { data: ExtractedProfile } | { error: string }
type GenerateResult = { viewUrl: string; resumeUrl: string } | { error: string }

const MAX_RESUME_BYTES = 5 * 1024 * 1024
// InsForge uploads via a presigned POST straight to S3 (~12.5s/MB measured), so a
// real résumé can take ~40-60s. The timeout only guards against a true hang —
// keep it well above a realistic 5MB upload so it never cuts a legitimate one off.
const UPLOAD_TIMEOUT_MS = 90000
const RESUME_PATH = (userId: string): string => `${userId}/resume.pdf`

// Profile reads/writes run through the authenticated browser client. The SDK
// doesn't expose the access token for forwarding to a Nitro route, so server
// routes can't act as the user without the SSR cookie migration (deferred).
// RLS still scopes every query to auth.uid(), so client-side writes stay safe;
// profile save carries no secrets. The server-auth foundation lands before
// feature 10 (Adzuna), the first feature that needs server-side keys.
export function useProfile() {
  const insforge = useInsforge()
  const { user } = useAuth()

  async function fetchProfile(): Promise<ProfileResult> {
    const userId = user.value?.id
    if (!userId) return { success: false, error: 'You are not signed in.' }
    try {
      // maybeSingle so a user with no row yet (e.g. one created before the signup
      // trigger existed) loads as an empty profile instead of erroring.
      const { data, error } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (error) {
        console.error('[composables/useProfile] fetchProfile', error)
        return { success: false, error: 'Could not load your profile.' }
      }
      return { success: true, data: data ?? undefined }
    } catch (error) {
      console.error('[composables/useProfile] fetchProfile', error)
      return { success: false, error: 'Could not load your profile.' }
    }
  }

  // Best-effort: a slow/blocked upload resolves as an error after the timeout and
  // never blocks the profile save. Removing the existing object first keeps the
  // key deterministic — upload() auto-renames on collision ("resume (1).pdf"),
  // which would otherwise break the stored URL and the View action.
  async function uploadResume(
    userId: string,
    file: File
  ): Promise<{ url: string } | { error: string }> {
    if (file.type !== 'application/pdf') return { error: 'Résumé must be a PDF.' }
    if (file.size > MAX_RESUME_BYTES) return { error: 'Résumé must be 5MB or smaller.' }

    const path = RESUME_PATH(userId)
    await insforge.storage.from('resumes').remove(path)

    const timeout = new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), UPLOAD_TIMEOUT_MS)
    )
    const outcome = await Promise.race([
      insforge.storage.from('resumes').upload(path, file),
      timeout
    ])
    if (outcome === 'timeout') {
      return { error: 'the upload timed out — try it again.' }
    }
    if (outcome.error || !outcome.data) {
      console.error('[composables/useProfile] uploadResume', outcome.error)
      return { error: 'the upload failed.' }
    }
    // Store the URL the backend returns, not a guessed path.
    return { url: outcome.data.url }
  }

  async function saveProfile(
    update: ProfileUpdate,
    resumeFile: File | null,
    onPhase?: (phase: SavePhase) => void
  ): Promise<ProfileResult> {
    const userId = user.value?.id
    if (!userId) return { success: false, error: 'You are not signed in.' }
    try {
      // upsert (not update) so a user whose row predates the signup trigger can
      // still save — id + email cover the insert case. RLS scopes it to auth.uid().
      // is_complete is derived here so it can never drift from the form's values.
      const row: Record<string, unknown> = {
        id: userId,
        email: user.value?.email ?? null,
        ...update,
        is_complete: computeProfileCompletion(update).isComplete
      }
      const { data, error } = await insforge.database
        .from('profiles')
        .upsert(row)
        .select()
        .single()
      if (error) {
        console.error('[composables/useProfile] saveProfile', error)
        return { success: false, error: 'Could not save your profile.' }
      }

      // The profile fields are saved. The résumé runs after, best-effort, so a
      // slow or blocked upload can never hang the save.
      if (!resumeFile) return { success: true, data }

      onPhase?.('uploading')
      const uploaded = await uploadResume(userId, resumeFile)
      if ('error' in uploaded) {
        return { success: true, data, warning: `Profile saved, but ${uploaded.error}` }
      }

      const { data: withResume, error: linkError } = await insforge.database
        .from('profiles')
        .update({ resume_pdf_url: uploaded.url })
        .eq('id', userId)
        .select()
        .single()
      if (linkError) {
        console.error('[composables/useProfile] saveProfile link', linkError)
        return { success: true, data, warning: 'Profile saved, but the résumé link could not be stored.' }
      }
      return { success: true, data: withResume }
    } catch (error) {
      console.error('[composables/useProfile] saveProfile', error)
      return { success: false, error: 'Could not save your profile.' }
    }
  }

  // The bucket is private, so a stored URL won't open directly — download the
  // object and hand back a blob URL the caller can open in a new tab.
  async function getResumeObjectUrl(): Promise<{ url: string } | { error: string }> {
    const userId = user.value?.id
    if (!userId) return { error: 'You are not signed in.' }
    try {
      const { data, error } = await insforge.storage
        .from('resumes')
        .download(RESUME_PATH(userId))
      if (error || !data) {
        console.error('[composables/useProfile] getResumeObjectUrl', error)
        return { error: 'Could not open your résumé.' }
      }
      // Force the PDF type so the browser renders it inline rather than downloading.
      const pdf =
        data.type === 'application/pdf' ? data : new Blob([data], { type: 'application/pdf' })
      return { url: URL.createObjectURL(pdf) }
    } catch (error) {
      console.error('[composables/useProfile] getResumeObjectUrl', error)
      return { error: 'Could not open your résumé.' }
    }
  }

  // Sends résumé bytes to the stateless extraction route and returns the fields
  // it found. Prefers the freshly staged file; otherwise downloads the résumé on
  // file via the browser client (the server never reads storage itself). Returns
  // a partial profile for the form to merge — it does not save.
  async function extractFromResume(file: File | null): Promise<ExtractResult> {
    let pdfFile = file
    if (!pdfFile) {
      const userId = user.value?.id
      if (!userId) return { error: 'You are not signed in.' }
      const { data, error } = await insforge.storage
        .from('resumes')
        .download(RESUME_PATH(userId))
      if (error || !data) {
        return { error: 'Upload a résumé first, then extract.' }
      }
      pdfFile = new File([data], 'resume.pdf', { type: 'application/pdf' })
    }

    try {
      const form = new FormData()
      form.append('resume', pdfFile)
      const result = await $fetch<{ data: ExtractedProfile }>('/api/resume/extract', {
        method: 'POST',
        body: form,
      })
      return { data: result.data }
    } catch (error) {
      console.error('[composables/useProfile] extractFromResume', error)
      // h3's createError puts the friendly text on the response body (message +
      // statusMessage), which ofetch surfaces under error.data.
      const data = (error as { data?: { message?: string; statusMessage?: string } })?.data
      return { error: data?.message ?? data?.statusMessage ?? 'Could not read your résumé. Please try again.' }
    }
  }

  // Sends the saved profile to the stateless generation route, which returns a
  // freshly written PDF. The bytes are uploaded via the browser client (same
  // path/overwrite as an uploaded résumé — one active résumé per user) and the
  // resume_pdf_url is linked. Returns a blob URL the caller opens to view it.
  async function generateResume(profile: Profile): Promise<GenerateResult> {
    const userId = user.value?.id
    if (!userId) return { error: 'You are not signed in.' }

    // Gate matches the server guard — a thin profile yields an empty résumé.
    const hasRole = (profile.work_experience ?? []).some((role) => role?.company || role?.title)
    if (!profile.full_name?.trim() || !profile.current_title?.trim() || !hasRole) {
      return {
        error:
          'Add your name, current title, and at least one work experience entry before generating a résumé.',
      }
    }

    let pdf: Blob
    try {
      const blob = await $fetch<Blob>('/api/resume/generate', {
        method: 'POST',
        body: profile,
        responseType: 'blob',
      })
      pdf = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' })
    } catch (error) {
      console.error('[composables/useProfile] generateResume', error)
      const data = (error as { data?: { message?: string; statusMessage?: string } })?.data
      return { error: data?.message ?? data?.statusMessage ?? 'Could not generate your résumé. Please try again.' }
    }

    const file = new File([pdf], 'resume.pdf', { type: 'application/pdf' })
    const uploaded = await uploadResume(userId, file)
    if ('error' in uploaded) return { error: `Résumé generated, but ${uploaded.error}` }

    const { error: linkError } = await insforge.database
      .from('profiles')
      .update({ resume_pdf_url: uploaded.url })
      .eq('id', userId)
    if (linkError) {
      console.error('[composables/useProfile] generateResume link', linkError)
      return { error: 'Résumé generated, but the link could not be saved.' }
    }

    return { viewUrl: URL.createObjectURL(pdf), resumeUrl: uploaded.url }
  }

  return { fetchProfile, saveProfile, getResumeObjectUrl, extractFromResume, generateResume }
}
