import { u as useInsforge } from './useInsforge-DhfvSzIK.mjs';
import { u as useAuth } from './useAuth-DqhK3zbv.mjs';
import { a as useState } from './server.mjs';
import { computed } from 'vue';

const MATCH_THRESHOLD = 70;
function niceChartMax(values, floor = 4) {
  const peak = Math.max(0, floor, ...values);
  return Math.ceil(peak / 4) * 4;
}
function formatRelativeTime(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1e3);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function useJobs() {
  const insforge = useInsforge();
  const { user } = useAuth();
  const jobs = useState("jobs:list", () => []);
  const loading = useState("jobs:loading", () => false);
  const loaded = useState("jobs:loaded", () => false);
  const query = useState("jobs:query", () => "");
  const matchFilter = useState("jobs:matchFilter", () => "all");
  const sort = useState("jobs:sort", () => "score");
  const filteredJobs = computed(() => {
    const q = query.value.trim().toLowerCase();
    const result = jobs.value.filter((job) => {
      const score = job.match_score ?? 0;
      if (matchFilter.value === "high" && score < MATCH_THRESHOLD) return false;
      if (matchFilter.value === "low" && score >= MATCH_THRESHOLD) return false;
      if (q) {
        const haystack = `${job.company ?? ""} ${job.title ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return result.sort((a, b) => {
      if (sort.value === "score") return (b.match_score ?? 0) - (a.match_score ?? 0);
      const aTime = new Date(a.found_at).getTime();
      const bTime = new Date(b.found_at).getTime();
      return sort.value === "oldest" ? aTime - bTime : bTime - aTime;
    });
  });
  async function refresh() {
    const userId = user.value?.id;
    if (!userId) return;
    loading.value = true;
    try {
      const { data, error } = await insforge.database.from("jobs").select("*").eq("user_id", userId).order("found_at", { ascending: false });
      if (error) {
        console.error("[composables/useJobs] refresh", error);
        return;
      }
      jobs.value = data ?? [];
    } catch (error) {
      console.error("[composables/useJobs] refresh", error);
    } finally {
      loading.value = false;
      loaded.value = true;
    }
  }
  async function fetchJob(id) {
    const userId = user.value?.id;
    if (!userId) return null;
    try {
      const { data, error } = await insforge.database.from("jobs").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
      if (error) {
        console.error("[composables/useJobs] fetchJob", error);
        return null;
      }
      return data ?? null;
    } catch (error) {
      console.error("[composables/useJobs] fetchJob", error);
      return null;
    }
  }
  return { jobs, filteredJobs, loading, loaded, query, matchFilter, sort, refresh, fetchJob };
}

export { formatRelativeTime as f, niceChartMax as n, useJobs as u };
//# sourceMappingURL=useJobs-DSRPZSOZ.mjs.map
