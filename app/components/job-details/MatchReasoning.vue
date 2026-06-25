<script setup lang="ts">
import type { Job } from "~~/types";

type Props = {
  job: Job;
};

defineProps<Props>();
</script>

<template>
  <div
    class="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <div class="mb-3 flex items-center gap-2">
      <svg
        class="h-4 w-4 text-accent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"
        />
      </svg>
      <h2 class="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
        AI Match Reasoning
      </h2>
    </div>
    <p class="text-[14px] leading-6 text-text-secondary">
      {{ job.match_reason ?? "No match reasoning available for this job yet." }}
    </p>
  </div>
</template>
