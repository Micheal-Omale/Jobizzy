import type { Profile } from '../../../types'
import { createInsforgeServer } from '../../utils/insforge'
import { searchJobs, formatSalary } from '../../../lib/adzuna'
import { scoreJob } from '../../utils/score-job'
import { createPostHogServer } from '../../utils/posthog'
import { isTransientError } from '../../utils/gemini'
import { MATCH_THRESHOLD } from '../../../lib/utils'

// Gemini's free tier caps gemini-2.5-flash at 20 requests/min. Scoring is one
// call per job, so a 10-job search would burst toward that cap — space the calls
// out to stay comfortably under it. ~2.5s between jobs ≈ <17 calls/min.
const SCORE_DELAY_MS = 2500
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// POST /api/agent/find — the job-discovery agent. Acts as the signed-in user
// (SSR cookie → server client): searches Adzuna, scores each result against the
// user's profile with Gemini, saves jobs + an agent_runs record, and returns the
// counts the Find Jobs banner shows. Synchronous by design for this feature.
export default defineEventHandler(async (event) => {
  const insforge = createInsforgeServer(event)
  const { data: auth, error: authError } = await insforge.auth.getCurrentUser()
  const user = auth?.user
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{ jobTitle?: string; location?: string }>(event)
  const jobTitle = body?.jobTitle?.trim()
  const location = body?.location?.trim() ?? ''
  if (!jobTitle) {
    throw createError({ statusCode: 400, statusMessage: 'A job title is required.' })
  }

  // Scoring needs the profile. Load it (scoped to the user by id, RLS-enforced).
  const { data: profile, error: profileError } = await insforge.database
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>()
  if (profileError) {
    console.error('[api/agent/find] profile', profileError)
    throw createError({ statusCode: 502, statusMessage: 'Could not load your profile.' })
  }
  const hasProfileSignal = !!profile && ((profile.skills?.length ?? 0) > 0 || !!profile.current_title)
  if (!hasProfileSignal) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Complete your profile (skills and current title) before searching.'
    })
  }

  const config = useRuntimeConfig()
  const posthog = createPostHogServer()
  let runId: string | null = null

  try {
    posthog.capture({
      distinctId: user.id,
      event: 'job_search_started',
      properties: { userId: user.id, jobTitle, location }
    })

    // Open the run before searching so progress is recorded even if a later step fails.
    const { data: run, error: runError } = await insforge.database
      .from('agent_runs')
      .insert({
        user_id: user.id,
        status: 'running',
        job_title_searched: jobTitle,
        location_searched: location || null,
        started_at: new Date().toISOString()
      })
      .select()
      .single()
    if (runError || !run) {
      throw createError({ statusCode: 502, statusMessage: 'Could not start the search.' })
    }
    runId = run.id

    const adzunaJobs = await searchJobs(jobTitle, location, config.adzunaAppId, config.adzunaAppKey)

    let strongMatches = 0
    let savedCount = 0
    // Sequential per-job scoring (chosen approach): one Gemini call each, robust
    // structured output, and a clean job_found event per saved job. Throttled to
    // respect the free-tier rate limit; one failed/rate-limited job is skipped
    // rather than sinking the whole run.
    for (let i = 0; i < adzunaJobs.length; i++) {
      const job = adzunaJobs[i]!
      if (i > 0) await delay(SCORE_DELAY_MS)

      let scored
      try {
        scored = await scoreJob(job, profile as Profile)
      } catch (scoreError) {
        console.error('[api/agent/find] score', scoreError)
        continue
      }

      const { error: insertError } = await insforge.database.from('jobs').insert({
        user_id: user.id,
        run_id: runId,
        source: 'search',
        source_url: job.redirect_url ?? null,
        external_apply_url: job.redirect_url ?? null,
        title: job.title ?? null,
        company: job.company?.display_name ?? null,
        location: job.location?.display_name ?? null,
        salary: formatSalary(job.salary_min, job.salary_max),
        job_type: job.contract_type ?? 'fulltime',
        about_role: job.description ?? null,
        match_score: scored.matchScore,
        match_reason: scored.matchReason,
        matched_skills: scored.matchedSkills,
        missing_skills: scored.missingSkills,
        found_at: new Date().toISOString()
      })
      if (insertError) {
        console.error('[api/agent/find] job insert', insertError)
        continue // skip this job, keep the run going
      }

      savedCount++
      if (scored.matchScore >= MATCH_THRESHOLD) strongMatches++
      posthog.capture({
        distinctId: user.id,
        event: 'job_found',
        properties: { userId: user.id, source: 'search', matchScore: scored.matchScore }
      })
    }

    await insforge.database
      .from('agent_runs')
      .update({
        status: 'completed',
        jobs_found: savedCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', runId)
      .eq('user_id', user.id)

    return { runId, count: savedCount, strongMatches }
  } catch (error) {
    // Best-effort mark the run failed so it doesn't sit "running" forever.
    if (runId) {
      await insforge.database
        .from('agent_runs')
        .update({ status: 'failed', completed_at: new Date().toISOString() })
        .eq('id', runId)
        .eq('user_id', user.id)
        .then(undefined, () => {})
    }

    // Re-throw an explicit createError unchanged; otherwise classify.
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    console.error('[api/agent/find]', error)
    const busy = isTransientError(error)
    throw createError({
      statusCode: busy ? 503 : 502,
      statusMessage: busy
        ? 'The job agent is busy right now. Please try again in a moment.'
        : 'The job search could not be completed. Please try again.'
    })
  } finally {
    await posthog.shutdown()
  }
})
