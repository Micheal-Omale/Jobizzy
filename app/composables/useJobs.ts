import type { Job } from '~~/types'
import { MATCH_THRESHOLD } from '~~/lib/utils'

export type MatchFilter = 'all' | 'high' | 'low'
export type JobSort = 'score' | 'newest' | 'oldest'

// Shared list of the signed-in user's discovered jobs. State lives in useState so
// the search controls (which trigger a refresh after a run), the filters bar
// (which sets query/filter/sort), and the table (which renders the derived list)
// all stay in sync without prop drilling. Reads go through the authenticated
// browser client; RLS scopes every row to the user.
export function useJobs() {
  const insforge = useInsforge()
  const { user } = useAuth()

  const jobs = useState<Job[]>('jobs:list', () => [])
  const loading = useState<boolean>('jobs:loading', () => false)
  const loaded = useState<boolean>('jobs:loaded', () => false)

  // Filter/sort controls — shared so Filters.vue writes and Table.vue reads them.
  const query = useState<string>('jobs:query', () => '')
  const matchFilter = useState<MatchFilter>('jobs:matchFilter', () => 'all')
  const sort = useState<JobSort>('jobs:sort', () => 'score')

  // Jobs after applying the match filter + text search, then sorted. Table paginates
  // the result. Treat a missing match_score as 0 so it never counts as a high match.
  const filteredJobs = computed<Job[]>(() => {
    const q = query.value.trim().toLowerCase()
    const result = jobs.value.filter((job) => {
      const score = job.match_score ?? 0
      if (matchFilter.value === 'high' && score < MATCH_THRESHOLD) return false
      if (matchFilter.value === 'low' && score >= MATCH_THRESHOLD) return false
      if (q) {
        const haystack = `${job.company ?? ''} ${job.title ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    return result.sort((a, b) => {
      if (sort.value === 'score') return (b.match_score ?? 0) - (a.match_score ?? 0)
      const aTime = new Date(a.found_at).getTime()
      const bTime = new Date(b.found_at).getTime()
      return sort.value === 'oldest' ? aTime - bTime : bTime - aTime
    })
  })

  async function refresh(): Promise<void> {
    const userId = user.value?.id
    if (!userId) return
    loading.value = true
    try {
      const { data, error } = await insforge.database
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('found_at', { ascending: false })
      if (error) {
        console.error('[composables/useJobs] refresh', error)
        return
      }
      jobs.value = (data ?? []) as Job[]
    } catch (error) {
      console.error('[composables/useJobs] refresh', error)
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  // Load a single job by id for the details page (feature 12). RLS scopes it to
  // the user, and the explicit user_id filter keeps the query consistent with the
  // list reads. Returns null when the job is missing or not the user's.
  async function fetchJob(id: string): Promise<Job | null> {
    const userId = user.value?.id
    if (!userId) return null
    try {
      const { data, error } = await insforge.database
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .eq('id', id)
        .maybeSingle()
      if (error) {
        console.error('[composables/useJobs] fetchJob', error)
        return null
      }
      return (data as Job | null) ?? null
    } catch (error) {
      console.error('[composables/useJobs] fetchJob', error)
      return null
    }
  }

  return { jobs, filteredJobs, loading, loaded, query, matchFilter, sort, refresh, fetchJob }
}
