<script setup lang="ts">
import { computed } from "vue";
import type { Job } from "~~/types";
import { MATCH_THRESHOLD } from "~~/lib/utils";

type Props = {
  job: Job;
};

const props = defineProps<Props>();

const matchScore = computed<number>(() => props.job.match_score ?? 0);

// Header match score uses a simpler good/ok/low scale than the find-jobs bar:
// 90+ green, at/above the strong-match line amber, below it red — which renders
// the design's amber 86%.
const scoreColor = computed<string>(() => {
  if (matchScore.value >= 90) return "text-success";
  if (matchScore.value >= MATCH_THRESHOLD) return "text-warning";
  return "text-error";
});

const jobPostUrl = computed<string | null>(
  () => props.job.external_apply_url ?? props.job.source_url ?? null,
);
</script>

<template>
  <div
    class="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-4">
        <div
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary text-text-muted"
        >
          <svg
            class="h-6 w-6"
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
        <div>
          <h1 class="text-[24px] font-bold leading-8 text-text-primary">
            {{ job.title ?? "—" }}
          </h1>
          <div class="mt-1.5 flex flex-wrap items-center gap-2 text-[14px]">
            <span class="text-text-secondary">{{ job.company ?? "—" }}</span>
            <svg
              class="h-3.5 w-3.5 text-text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span class="font-semibold" :class="scoreColor">{{ matchScore }}% Match Score</span>
          </div>
        </div>
      </div>

      <a
        v-if="jobPostUrl"
        :href="jobPostUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary"
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
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
        View Job Post
      </a>
    </div>
  </div>
</template>
