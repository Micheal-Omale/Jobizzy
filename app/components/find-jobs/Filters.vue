<script setup lang="ts">
// Bound to the shared useJobs state: Table.vue derives its rows from query +
// matchFilter + sort, so writing them here re-filters the table reactively.
const { query, matchFilter, sort } = useJobs();

const selectClass =
  "cursor-pointer appearance-none rounded-md border border-border bg-surface py-2.5 pl-4 pr-9 text-[14px] font-medium text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div class="relative flex-1">
      <svg
        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        v-model="query"
        type="text"
        placeholder="Filter by company or role..."
        class="w-full rounded-md border border-border bg-surface py-2.5 pl-9 pr-3 text-[14px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>

    <div class="flex items-center gap-3">
      <div class="relative">
        <select v-model="matchFilter" :class="selectClass" aria-label="Match filter">
          <option value="all">All Matches</option>
          <option value="high">High Match</option>
          <option value="low">Low Match</option>
        </select>
        <svg
          class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <div class="relative">
        <select v-model="sort" :class="selectClass" aria-label="Sort by">
          <option value="score">Match Score</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <svg
          class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  </div>
</template>
