import { GoogleGenAI } from '@google/genai'
import type { GenerateContentParameters } from '@google/genai'

// Single shared Google GenAI client for all server-side AI calls. Résumé
// extraction (07) and generation (08) are the first consumers; job matching (10)
// and research synthesis (13) will reuse it. The key comes from server-private
// runtimeConfig — it must never reach the browser.
let client: GoogleGenAI | null = null

export function getGemini(): GoogleGenAI {
  if (client) return client
  const { geminiApiKey } = useRuntimeConfig()
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  client = new GoogleGenAI({ apiKey: geminiApiKey })
  return client
}

const MAX_ATTEMPTS = 3

// Gemini's flash models throw transient 503 UNAVAILABLE / 429 spikes under load.
// Retry a few times with linear backoff before giving up. Shared by every
// server-side AI call so retry behaviour stays consistent.
export async function generateWithRetry(
  ai: GoogleGenAI,
  request: GenerateContentParameters,
) {
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await ai.models.generateContent(request)
    } catch (error) {
      lastError = error
      if (!isTransientError(error) || attempt === MAX_ATTEMPTS) throw error
      await new Promise((resolve) => setTimeout(resolve, 600 * attempt))
    }
  }
  throw lastError
}

// JSON mode returns pure JSON, but strip a stray ```json fence just in case so a
// formatting hiccup doesn't sink an otherwise-good response.
export function parseJsonLoose(raw: string): Record<string, unknown> {
  let text = raw.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Model returned invalid JSON')
  }
}

// True for overload/rate-limit errors worth retrying (or telling the user to
// retry) rather than failing as a permanent error.
export function isTransientError(error: unknown): boolean {
  const text = String(
    (error as { status?: unknown })?.status ??
      (error as { message?: unknown })?.message ??
      error,
  ).toLowerCase()
  return (
    text.includes('unavailable') ||
    text.includes('503') ||
    text.includes('429') ||
    text.includes('resource_exhausted') ||
    text.includes('overloaded') ||
    text.includes('high demand')
  )
}
