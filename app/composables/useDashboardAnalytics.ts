import type { ChartPoint, DashboardAnalytics, Job } from '~~/types'

// Feeds the dashboard's three analytics charts (feature 17). The PostHog
// job_found / company_researched events are themselves derived from the jobs
// table (captured the moment a row is written), so the same numbers already live
// in the in-memory job list useJobs loaded for the stats — no PostHog Query API,
// no personal key, no extra round-trip. Same client-side-derive approach as
// useDashboardStats (feature 15) and useRecentActivity (feature 16).

const WEEKDAY_FMT = new Intl.DateTimeFormat('en-US', { weekday: 'short' })

// The five fixed match-score buckets, in chart order.
const SCORE_BUCKETS = ['50-60%', '60-70%', '70-80%', '80-90%', '90-100%'] as const

function scoreBucket(score: number): (typeof SCORE_BUCKETS)[number] {
  if (score < 60) return '50-60%'
  if (score < 70) return '60-70%'
  if (score < 80) return '70-80%'
  if (score < 90) return '80-90%'
  return '90-100%'
}

// Last 7 calendar days ending today (local), oldest→newest, as { key, label }.
// Rolling window so the chart always ends at "now" — an honest "over time" view.
function lastSevenDays(): { key: string; label: string }[] {
  const days: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    days.push({ key: dayKey(d), label: WEEKDAY_FMT.format(d) })
  }
  return days
}

// Local YYYY-MM-DD so a job's found_at lands in the right day bucket.
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Counts jobs per day over the 7-day window using each job's `when` timestamp,
// zero-filling empty days so the chart always shows 7 slots.
function dailyCounts(items: Job[], when: (job: Job) => string): ChartPoint[] {
  const days = lastSevenDays()
  const counts = new Map<string, number>(days.map((d) => [d.key, 0]))
  for (const job of items) {
    const key = dayKey(new Date(when(job)))
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return days.map((d) => ({ label: d.label, value: counts.get(d.key) ?? 0 }))
}

export function useDashboardAnalytics() {
  const { jobs, loading, loaded, refresh } = useJobs()

  const data = computed<DashboardAnalytics>(() => {
    const list = jobs.value

    // Match Score Distribution — every scored job, bucketed into the 5 ranges.
    const dist = new Map<string, number>(SCORE_BUCKETS.map((b) => [b, 0]))
    for (const job of list) {
      if (job.match_score === null) continue
      const b = scoreBucket(job.match_score)
      dist.set(b, (dist.get(b) ?? 0) + 1)
    }
    const matchDistribution = SCORE_BUCKETS.map((label) => ({
      label,
      value: dist.get(label) ?? 0
    }))

    return {
      // Jobs Found Over Time — every job, keyed by found_at.
      jobsFound: dailyCounts(list, (job) => job.found_at),
      matchDistribution,
      // Company Research Activity — jobs whose research dossier is populated.
      // jobs.company_research has no timestamp, so found_at is the proxy (the
      // same approximation useRecentActivity makes).
      companyResearch: dailyCounts(
        list.filter((job) => job.company_research !== null),
        (job) => job.found_at
      )
    }
  })

  return { data, loading, loaded, refresh }
}
