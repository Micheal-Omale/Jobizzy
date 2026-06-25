<script setup lang="ts">
import { formatRelativeTime } from "~~/lib/utils";

// Real InsForge rows (shared via useJobs). filteredJobs already has the match
// filter, text search, and sort applied; the table just paginates it.
const { jobs, filteredJobs, loading, loaded, query, matchFilter, sort } = useJobs();

// True when the user has jobs but the current filter/search hides them all — so
// the empty state can say "no matches" instead of "run a search".
const hasJobsButNoMatches = computed(() => jobs.value.length > 0 && filteredJobs.value.length === 0);

const PAGE_SIZE = 20;
const currentPage = ref(1);
// Reset to the first page whenever the visible set changes — a new search lands
// rows at the top, and a filter/sort/search change can shrink the page count.
watch([filteredJobs, query, matchFilter, sort], () => {
  currentPage.value = 1;
});

const total = computed(() => filteredJobs.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
const pagedJobs = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredJobs.value.slice(start, start + PAGE_SIZE);
});
const rangeStart = computed(() => (total.value === 0 ? 0 : (currentPage.value - 1) * PAGE_SIZE + 1));
const rangeEnd = computed(() => Math.min(currentPage.value * PAGE_SIZE, total.value));

// Compact pager: all pages when few, else first/last with a window around current.
const pageItems = computed<(number | "…")[]>(() => {
  const count = pageCount.value;
  const cur = currentPage.value;
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const start = Math.max(2, cur - 1);
  const end = Math.min(count - 1, cur + 1);
  if (start > 2) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < count - 1) items.push("…");
  items.push(count);
  return items;
});

function goTo(page: number): void {
  if (page >= 1 && page <= pageCount.value) currentPage.value = page;
}

const headClass =
  "px-6 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-text-secondary";
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] border-collapse">
        <thead class="bg-surface-secondary">
          <tr>
            <th scope="col" :class="headClass">Company</th>
            <th scope="col" :class="headClass">Role</th>
            <th scope="col" :class="headClass">Match Score</th>
            <th scope="col" :class="headClass">Salary Est.</th>
            <th scope="col" :class="headClass">Date Found</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading (first load) -->
          <tr v-if="loading && !loaded">
            <td colspan="5" class="px-6 py-12 text-center text-[14px] text-text-secondary">
              Loading jobs…
            </td>
          </tr>

          <!-- Empty: jobs exist but the filter/search hides them all -->
          <tr v-else-if="loaded && hasJobsButNoMatches">
            <td colspan="5" class="px-6 py-12 text-center">
              <p class="text-[14px] font-medium text-text-primary">No matching jobs</p>
              <p class="mt-1 text-[13px] text-text-secondary">
                Try adjusting your filters or search to see more results.
              </p>
            </td>
          </tr>

          <!-- Empty: no jobs at all -->
          <tr v-else-if="loaded && total === 0">
            <td colspan="5" class="px-6 py-12 text-center">
              <p class="text-[14px] font-medium text-text-primary">No jobs yet</p>
              <p class="mt-1 text-[13px] text-text-secondary">
                Run a search above to discover roles matched to your profile.
              </p>
            </td>
          </tr>

          <!-- Rows -->
          <tr
            v-for="job in pagedJobs"
            v-else
            :key="job.id"
            class="cursor-pointer border-t border-border hover:bg-surface-secondary"
            @click="navigateTo(`/find-jobs/${job.id}`)"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted"
                >
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                    <path d="M10 6h4" />
                    <path d="M10 10h4" />
                    <path d="M10 14h4" />
                    <path d="M10 18h4" />
                  </svg>
                </div>
                <span class="text-[14px] font-semibold text-text-primary">{{
                  job.company ?? "—"
                }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-[14px] text-text-primary">{{ job.title ?? "—" }}</td>
            <td class="px-6 py-4">
              <FindJobsMatchScoreBar :score="job.match_score ?? 0" />
            </td>
            <td class="px-6 py-4 text-[14px] text-text-primary">{{ job.salary ?? "—" }}</td>
            <td class="px-6 py-4 text-[14px] text-text-secondary">
              {{ formatRelativeTime(job.found_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="total > 0"
      class="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-[14px] text-text-secondary">
        Showing <span class="font-medium text-text-primary">{{ rangeStart }}</span> to
        <span class="font-medium text-text-primary">{{ rangeEnd }}</span> of
        <span class="font-medium text-text-primary">{{ total }}</span> results
      </p>
      <div v-if="pageCount > 1" class="flex items-center gap-2">
        <button
          type="button"
          :disabled="currentPage === 1"
          class="rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          @click="goTo(currentPage - 1)"
        >
          Previous
        </button>
        <button
          v-for="(page, i) in pageItems"
          :key="i"
          type="button"
          :disabled="page === '…'"
          class="h-8 min-w-8 rounded-md px-2 text-[13px] font-medium"
          :class="
            page === currentPage
              ? 'border border-accent bg-accent text-accent-foreground'
              : page === '…'
                ? 'cursor-default text-text-muted'
                : 'border border-border bg-surface text-text-primary hover:bg-surface-secondary'
          "
          @click="typeof page === 'number' && goTo(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          :disabled="currentPage === pageCount"
          class="rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          @click="goTo(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
