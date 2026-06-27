<script setup lang="ts">
// Bound to the shared useJobs state: Table.vue derives its rows from query +
// matchFilter + sort, so writing them here re-filters the table reactively.
const { query, matchFilter, sort } = useJobs();

const selectClass =
  "jz-frame cursor-pointer appearance-none rounded-[9px] border-2 border-border bg-surface py-[11px] pl-4 pr-9 text-[14px] font-semibold text-text focus:outline-none";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3.5">
    <div class="jz-frame flex min-w-[240px] flex-1 items-center gap-2.5 rounded-[9px] border-2 border-border bg-surface px-3.5 py-[11px]">
      <svg class="shrink-0 text-text-3" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        v-model="query"
        type="text"
        placeholder="Filter by company or role…"
        class="w-full bg-transparent text-[14px] text-text placeholder:text-text-3 focus:outline-none"
      />
    </div>

    <div class="relative">
      <select v-model="matchFilter" :class="selectClass" aria-label="Match filter">
        <option value="all">All Matches</option>
        <option value="high">High Match</option>
        <option value="low">Low Match</option>
      </select>
      <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>

    <div class="relative">
      <select v-model="sort" :class="selectClass" aria-label="Sort by">
        <option value="score">Match Score</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  </div>
</template>
