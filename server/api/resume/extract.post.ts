// Stateless résumé extraction. The browser sends the PDF bytes (the freshly
// staged file, or the one already on file, downloaded client-side), so this
// route never touches InsForge DB or storage and needs no user auth — the only
// secret involved is the OpenAI key, which stays server-side.
//
// pdf-parse v2 is a pure-TS, ESM package shipping its own types — use the
// PDFParse class (the old default-function / lib-subpath import is gone).
import { PDFParse } from 'pdf-parse'
import { extractProfileFromText } from '../../utils/extract-profile'
import { isTransientError } from '../../utils/openai'

const MAX_BYTES = 5 * 1024 * 1024
const MIN_TEXT_LENGTH = 100

export default defineEventHandler(async (event) => {
  const form = await readFormData(event)
  const file = form.get('resume')

  if (!(file instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: 'No résumé file provided.' })
  }
  if (file.type !== 'application/pdf') {
    throw createError({ statusCode: 400, statusMessage: 'Résumé must be a PDF.' })
  }
  if (file.size > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'Résumé must be 5MB or smaller.' })
  }

  const data = new Uint8Array(await file.arrayBuffer())

  let text = ''
  try {
    const parser = new PDFParse({ data })
    try {
      const parsed = await parser.getText()
      text = parsed.text ?? ''
    } finally {
      await parser.destroy()
    }
  } catch (error) {
    // Image-based / malformed PDFs land here — surface the build-plan's message.
    console.error('[api/resume/extract] pdf-parse', error)
    throw createError({
      statusCode: 422,
      statusMessage: 'Could not extract text from this PDF. Please try a different file.',
      message: 'Could not extract text from this PDF. Please try a different file.',
    })
  }

  if (text.trim().length < MIN_TEXT_LENGTH) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Could not extract text from this PDF. Please try a different file.',
      message: 'Could not extract text from this PDF. Please try a different file.',
    })
  }

  try {
    const data = await extractProfileFromText(text)
    return { data }
  } catch (error) {
    console.error('[api/resume/extract] openai', error)
    const busy = isTransientError(error)
    const message = busy
      ? 'The résumé extractor is busy right now. Please try again in a moment.'
      : 'Could not read your résumé right now. Please try again.'
    throw createError({ statusCode: busy ? 503 : 502, statusMessage: message, message })
  }
})
