// Stateless résumé generation. The browser POSTs the saved profile JSON; this
// route runs Gemini + pdfmake and returns the PDF bytes. Like the extract route
// it never touches InsForge DB or storage and needs no user auth — the only
// secret involved is the Gemini key. The client uploads the returned PDF and
// links it via the authenticated browser client (useProfile).
import type { Profile } from '../../../types'
import { generateResumePdf } from '../../utils/generate-resume'
import { isTransientError } from '../../utils/gemini'

export default defineEventHandler(async (event) => {
  const profile = await readBody<Profile>(event)

  if (!profile || typeof profile !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'No profile provided.', message: 'No profile provided.' })
  }

  // Mirror the client-side gate so a thin profile never yields an empty résumé.
  const hasRole = Array.isArray(profile.work_experience)
    && profile.work_experience.some((role) => role?.company || role?.title)
  if (!profile.full_name?.trim() || !profile.current_title?.trim() || !hasRole) {
    const message =
      'Add your name, current title, and at least one work experience entry before generating a résumé.'
    throw createError({ statusCode: 422, statusMessage: message, message })
  }

  try {
    const pdf = await generateResumePdf(profile)
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', 'inline; filename="resume.pdf"')
    return pdf
  } catch (error) {
    console.error('[api/resume/generate]', error)
    const busy = isTransientError(error)
    const message = busy
      ? 'The résumé generator is busy right now. Please try again in a moment.'
      : 'Could not generate your résumé right now. Please try again.'
    throw createError({ statusCode: busy ? 503 : 502, statusMessage: message, message })
  }
})
