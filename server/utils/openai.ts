import OpenAI from 'openai'

// Single shared OpenAI client for all server-side AI calls: résumé extraction
// and generation, job matching, and company-research synthesis. The key comes
// from server-private runtimeConfig — it must never reach the browser.
let client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (client) return client
  const { openaiApiKey } = useRuntimeConfig()
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  client = new OpenAI({ apiKey: openaiApiKey })
  return client
}

export const AI_MODEL = 'gpt-4o'

const MAX_ATTEMPTS = 3

export interface ChatJsonOptions {
  system: string
  user: string
  temperature?: number
  maxTokens?: number
}

// One JSON-mode chat completion, wrapped in the retry the whole app shares.
// gpt-4o's JSON mode (response_format json_object) guarantees the reply is
// syntactically valid JSON — the prompt describes the exact shape, and each
// caller still sanitises the parsed object defensively (this replaces Gemini's
// responseSchema). Retries a few times with linear backoff on transient
// 429/5xx spikes before giving up.
export async function chatJson(options: ChatJsonOptions): Promise<string> {
  const ai = getOpenAI()
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        response_format: { type: 'json_object' },
      })
      return response.choices[0]?.message?.content ?? ''
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

// True for overload/rate-limit/timeout errors worth retrying (or telling the
// user to retry) rather than failing as a permanent error. The OpenAI SDK
// throws APIError with a numeric `status`; fall back to matching the message.
export function isTransientError(error: unknown): boolean {
  const status = (error as { status?: unknown })?.status
  if (typeof status === 'number' && (status === 429 || status >= 500)) return true
  const text = String(
    (error as { message?: unknown })?.message ?? error,
  ).toLowerCase()
  return (
    text.includes('429') ||
    text.includes('rate limit') ||
    text.includes('overloaded') ||
    text.includes('timeout') ||
    text.includes('econnreset') ||
    text.includes('502') ||
    text.includes('503') ||
    text.includes('504')
  )
}
