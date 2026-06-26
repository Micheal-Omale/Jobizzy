import type { Job } from '~~/types'

export type DashboardStat = {
  label: string
  value: string
  note: string
  trend?: string
  trendPositive?: boolean
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function averageScore(list: Job[]): number | null {
  const scored = list.filter((job) => job.match_score !== null)
  if (scored.length === 0) return null
  return scored.reduce((sum, job) => sum + (job.match_score ?? 0), 0) / scored.length
}

// Week-over-week count change. No prior-week jobs means no honest baseline, so the
// trend is omitted rather than shown as a fabricated or divide-by-zero figure.
function countTrend(current: number, previous: number): Pick<DashboardStat, 'trend' | 'trendPositive'> {
  if (previous === 0) return {}
  const pct = Math.round(((current - previous) / previous) * 100)
  return { trend: `${pct >= 0 ? '+' : ''}${pct}%`, trendPositive: pct >= 0 }
}

// Week-over-week change in average match score, expressed as a percentage-point delta.
function avgScoreTrend(current: Job[], previous: Job[]): Pick<DashboardStat, 'trend' | 'trendPositive'> {
  const cur = averageScore(current)
  const prev = averageScore(previous)
  if (cur === null || prev === null) return {}
  const delta = Math.round(cur - prev)
  return { trend: `${delta >= 0 ? '+' : ''}${delta}%`, trendPositive: delta >= 0 }
}

// Derives the four dashboard stat cards from the user's in-memory job list (loaded
// by useJobs, RLS-scoped). Counts are small, so deriving here avoids a separate
// aggregate round-trip — same client-side approach as the find-jobs filters.
export function useDashboardStats() {
  const { jobs, loading, loaded, refresh } = useJobs()

  const stats = computed<DashboardStat[]>(() => {
    const now = Date.now()
    const list = jobs.value

    const total = list.length
    const avg = averageScore(list)
    const avgMatch = avg === null ? 0 : Math.round(avg)
    const researched = list.filter((job) => job.company_research !== null).length

    const thisWeek = list.filter((job) => new Date(job.found_at).getTime() >= now - WEEK_MS)
    const prevWeek = list.filter((job) => {
      const t = new Date(job.found_at).getTime()
      return t >= now - 2 * WEEK_MS && t < now - WEEK_MS
    })

    const totalTrend = countTrend(thisWeek.length, prevWeek.length)
    const matchTrend = avgScoreTrend(thisWeek, prevWeek)

    return [
      {
        label: 'Total Jobs Found',
        value: String(total),
        note: totalTrend.trend ? 'vs last week' : 'All time',
        ...totalTrend,
      },
      {
        label: 'Avg. Match Rate',
        value: `${avgMatch}%`,
        note: matchTrend.trend ? 'vs last week' : 'Across all jobs',
        ...matchTrend,
      },
      {
        label: 'Companies Researched',
        value: String(researched),
        note: 'Total researched',
      },
      {
        label: 'Jobs This Week',
        value: String(thisWeek.length),
        note: 'New this week',
      },
    ]
  })

  return { stats, loading, loaded, refresh }
}
