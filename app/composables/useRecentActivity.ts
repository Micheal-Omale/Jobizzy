import type { AgentRun } from '~~/types'
import { formatRelativeTime } from '~~/lib/utils'

export type ActivityType = 'search' | 'research'

export type ActivityEntry = {
  id: string
  text: string
  time: string
  type: ActivityType
}

type RankedEntry = ActivityEntry & { timestamp: number }

const ACTIVITY_LIMIT = 6

// Merges two activity sources for the dashboard's Recent Activity card: completed
// job searches (agent_runs) and company-research dossiers (jobs.company_research).
// Research entries are derived from the in-memory job list useJobs already loaded;
// only agent_runs needs its own query. RLS scopes every read to the user.
export function useRecentActivity() {
  const insforge = useInsforge()
  const { user } = useAuth()
  const { jobs } = useJobs()

  const runs = useState<AgentRun[]>('activity:runs', () => [])
  const loading = useState<boolean>('activity:loading', () => false)
  const loaded = useState<boolean>('activity:loaded', () => false)

  async function refresh(): Promise<void> {
    const userId = user.value?.id
    if (!userId) return
    loading.value = true
    try {
      const { data, error } = await insforge.database
        .from('agent_runs')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(ACTIVITY_LIMIT)
      if (error) {
        console.error('[composables/useRecentActivity] refresh', error)
        return
      }
      runs.value = (data ?? []) as AgentRun[]
    } catch (error) {
      console.error('[composables/useRecentActivity] refresh', error)
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  // jobs.company_research has no dedicated timestamp, so found_at is the best proxy
  // for when a job (and its later research) entered the user's list.
  const activities = computed<ActivityEntry[]>(() => {
    const searchEntries: RankedEntry[] = runs.value.map((run) => {
      const when = run.completed_at ?? run.started_at
      return {
        id: `run-${run.id}`,
        text: `Found ${run.jobs_found} ${run.jobs_found === 1 ? 'job' : 'jobs'} for ${run.job_title_searched ?? 'your search'}`,
        time: formatRelativeTime(when),
        type: 'search',
        timestamp: new Date(when).getTime(),
      }
    })

    const researchEntries: RankedEntry[] = jobs.value
      .filter((job) => job.company_research !== null)
      .map((job) => ({
        id: `job-${job.id}`,
        text: `Researched ${job.company ?? 'a company'}`,
        time: formatRelativeTime(job.found_at),
        type: 'research',
        timestamp: new Date(job.found_at).getTime(),
      }))

    return [...searchEntries, ...researchEntries]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, ACTIVITY_LIMIT)
      .map(({ id, text, time, type }) => ({ id, text, time, type }))
  })

  return { activities, loading, loaded, refresh }
}
