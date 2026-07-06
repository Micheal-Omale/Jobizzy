<script setup lang="ts">
import { formatRelativeTime } from "~~/lib/utils";

// Real InsForge rows (shared via useJobs). filteredJobs already has the match
// filter, text search, and sort applied; the table just paginates it.
const { jobs, filteredJobs, loading, loaded, query, matchFilter, sort, selectedIds, toggleSelected, clearSelected, deleteJobs } =
  useJobs();

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

function initial(company: string | null): string {
  return (company ?? "—").charAt(0).toUpperCase();
}

const headClass =
  "px-[22px] py-[15px] text-left font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-text-3";

// --- Selection + delete -----------------------------------------------------
const selectedSet = computed(() => new Set(selectedIds.value));
const selectedCount = computed(() => selectedIds.value.length);

// Select-all reflects the rows currently visible on this page.
const allOnPageSelected = computed(
  () => pagedJobs.value.length > 0 && pagedJobs.value.every((job) => selectedSet.value.has(job.id)),
);

function toggleAllOnPage(): void {
  if (allOnPageSelected.value) {
    const pageIds = new Set(pagedJobs.value.map((job) => job.id));
    for (const id of selectedIds.value) if (pageIds.has(id)) toggleSelected(id);
  } else {
    for (const job of pagedJobs.value) if (!selectedSet.value.has(job.id)) toggleSelected(job.id);
  }
}

const confirmOpen = ref(false);
const deleting = ref(false);

async function confirmDelete(): Promise<void> {
  if (deleting.value) return;
  deleting.value = true;
  await deleteJobs([...selectedIds.value]);
  deleting.value = false;
  confirmOpen.value = false;
}
</script>

<template>
  <div class="jz-frame-lg overflow-hidden rounded-[14px] bg-surface">
    <!-- Bulk-action bar: appears once at least one job is marked. -->
    <div
      v-if="selectedCount > 0"
      class="flex items-center justify-between gap-3 border-b-2 border-border bg-surface-sunk px-[22px] py-3"
    >
      <p class="text-[13px] font-semibold text-text">
        {{ selectedCount }} selected
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg border-2 border-border-soft px-[13px] py-[7px] text-[13px] font-semibold text-text-3 hover:text-text"
          @click="clearSelected"
        >
          Clear
        </button>
        <button
          type="button"
          class="rounded-lg border-2 border-error bg-error px-[13px] py-[7px] text-[13px] font-semibold text-white hover:opacity-90"
          @click="confirmOpen = true"
        >
          Delete ({{ selectedCount }})
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] border-collapse">
        <thead class="border-b-2 border-border bg-surface-sunk">
          <tr>
            <th scope="col" :class="`${headClass} w-[46px] pr-0`">
              <input
                type="checkbox"
                class="h-4 w-4 cursor-pointer accent-accent align-middle"
                :checked="allOnPageSelected"
                aria-label="Select all jobs on this page"
                @change="toggleAllOnPage"
              />
            </th>
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
            <td colspan="6" class="px-[22px] py-12 text-center text-[14px] text-text-2">
              Loading jobs…
            </td>
          </tr>

          <!-- Empty: jobs exist but the filter/search hides them all -->
          <tr v-else-if="loaded && hasJobsButNoMatches">
            <td colspan="6" class="px-[22px] py-12 text-center">
              <p class="text-[14px] font-semibold text-text">No matching jobs</p>
              <p class="mt-1 text-[13px] text-text-2">
                Try adjusting your filters or search to see more results.
              </p>
            </td>
          </tr>

          <!-- Empty: no jobs at all -->
          <tr v-else-if="loaded && total === 0">
            <td colspan="6" class="px-[22px] py-12 text-center">
              <p class="text-[14px] font-semibold text-text">No jobs yet</p>
              <p class="mt-1 text-[13px] text-text-2">
                Run a search above to discover roles matched to your profile.
              </p>
            </td>
          </tr>

          <!-- Rows -->
          <tr
            v-for="job in pagedJobs"
            v-else
            :key="job.id"
            class="cursor-pointer border-b-[1.5px] border-border-soft hover:bg-surface-sunk"
            :class="selectedSet.has(job.id) ? 'bg-surface-sunk' : ''"
            @click="navigateTo(`/find-jobs/${job.id}`)"
          >
            <td class="px-[22px] py-[17px] pr-0" @click.stop>
              <input
                type="checkbox"
                class="h-4 w-4 cursor-pointer accent-accent align-middle"
                :checked="selectedSet.has(job.id)"
                :aria-label="`Select ${job.company ?? 'job'}`"
                @change="toggleSelected(job.id)"
              />
            </td>
            <td class="px-[22px] py-[17px]">
              <div class="flex items-center gap-[11px]">
                <span class="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border-2 border-border bg-surface-2 font-display text-[15px] font-bold text-text">
                  {{ initial(job.company) }}
                </span>
                <b class="text-[14.5px] text-text">{{ job.company ?? "—" }}</b>
              </div>
            </td>
            <td class="px-[22px] py-[17px] text-[14px] text-text-2">{{ job.title ?? "—" }}</td>
            <td class="px-[22px] py-[17px]">
              <FindJobsMatchScoreBar :score="job.match_score ?? 0" />
            </td>
            <td class="px-[22px] py-[17px] text-[13.5px] text-text-2">{{ job.salary ?? "—" }}</td>
            <td class="px-[22px] py-[17px] font-mono text-[12px] text-text-3">
              {{ formatRelativeTime(job.found_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="total > 0"
      class="flex flex-col gap-3 border-t-2 border-border bg-surface-sunk px-[22px] py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-[13px] text-text-2">
        Showing <b class="text-text">{{ rangeStart }}</b>–<b class="text-text">{{ rangeEnd }}</b> of
        <b class="text-text">{{ total }}</b> results
      </p>
      <div v-if="pageCount > 1" class="flex items-center gap-[7px]">
        <button
          type="button"
          :disabled="currentPage === 1"
          class="rounded-lg border-2 border-border-soft px-[13px] py-[7px] text-[13px] font-semibold text-text-3 hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          @click="goTo(currentPage - 1)"
        >
          Previous
        </button>
        <button
          v-for="(page, i) in pageItems"
          :key="i"
          type="button"
          :disabled="page === '…'"
          class="rounded-lg px-[13px] py-[7px] text-[13px] font-semibold"
          :class="
            page === currentPage
              ? 'border-2 border-border bg-accent text-white'
              : page === '…'
                ? 'cursor-default text-text-3'
                : 'border-2 border-border bg-surface text-text hover:bg-surface-sunk'
          "
          @click="typeof page === 'number' && goTo(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          :disabled="currentPage === pageCount"
          class="rounded-lg border-2 border-border bg-surface px-[13px] py-[7px] text-[13px] font-semibold text-text hover:bg-surface-sunk disabled:cursor-not-allowed disabled:opacity-50"
          @click="goTo(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete confirmation -->
    <Teleport to="body">
      <Transition name="jz-backdrop">
        <div
          v-if="confirmOpen"
          class="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
          @click.self="!deleting && (confirmOpen = false)"
        >
          <div
            class="jz-frame-lg w-full max-w-[420px] rounded-[14px] border-2 border-border bg-surface p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-jobs-title"
          >
            <h2 id="delete-jobs-title" class="font-display text-[19px] font-bold text-text">
              Delete {{ selectedCount }} {{ selectedCount === 1 ? "job" : "jobs" }}?
            </h2>
            <p class="mt-2 text-[14px] text-text-2">
              This permanently removes {{ selectedCount === 1 ? "it" : "them" }} from your list. This can't be undone.
            </p>
            <div class="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                :disabled="deleting"
                class="rounded-lg border-2 border-border-soft px-[15px] py-[9px] text-[13.5px] font-semibold text-text-3 hover:text-text disabled:opacity-50"
                @click="confirmOpen = false"
              >
                Cancel
              </button>
              <button
                type="button"
                :disabled="deleting"
                class="rounded-lg border-2 border-error bg-error px-[15px] py-[9px] text-[13.5px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
                @click="confirmDelete"
              >
                {{ deleting ? "Deleting…" : "Delete" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.jz-backdrop-enter-active,
.jz-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.jz-backdrop-enter-from,
.jz-backdrop-leave-to {
  opacity: 0;
}
</style>
