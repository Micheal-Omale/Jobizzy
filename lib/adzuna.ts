import type { AdzunaJob } from '../types'

// Adzuna supports per-country endpoints. We support these four; everything else
// falls back to 'us'. Keys are matched case-insensitively against the location.
const COUNTRY_KEYWORDS: Record<string, string[]> = {
  gb: ['united kingdom', 'uk', 'england', 'scotland', 'wales', 'london', 'manchester', 'britain'],
  au: ['australia', 'sydney', 'melbourne', 'brisbane', 'perth'],
  ca: ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary']
}

// Best-effort country detection from the free-text location. Defaults to 'us'.
export function detectCountry(location: string): string {
  const haystack = location.trim().toLowerCase()
  if (!haystack) return 'us'
  for (const [code, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) return code
  }
  return 'us'
}

// Searches Adzuna for IT jobs matching the title/location. Keys are passed in
// (from runtimeConfig) rather than read from process.env so the route owns
// config and this stays testable.
export async function searchJobs(
  jobTitle: string,
  location: string,
  appId: string,
  appKey: string,
  country: string = detectCountry(location)
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category: 'it-jobs', // always filter to IT jobs
    results_per_page: '10',
    'content-type': 'application/json'
  })

  // Only constrain by location when one was given — an empty `where` returns nothing.
  if (location.trim()) {
    params.set('where', location.trim())
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`
  )

  if (!response.ok) {
    // Surface Adzuna's body — its auth failures come back as 400 with an
    // { exception, display } payload, so the status alone hides the real cause.
    const detail = await response.text().catch(() => '')
    throw new Error(`Adzuna API error: ${response.status}${detail ? ` — ${detail.slice(0, 200)}` : ''}`)
  }

  const data = (await response.json()) as { results?: AdzunaJob[] }
  return data.results ?? []
}

// Formats Adzuna's numeric salary range into the "$50k - $70k" string the jobs
// table stores. Returns null when Adzuna gave no salary.
export function formatSalary(min?: number, max?: number): string | null {
  if (!min) return null
  const lo = `$${Math.round(min / 1000)}k`
  const hi = max ? `$${Math.round(max / 1000)}k` : null
  return hi ? `${lo} - ${hi}` : lo
}
