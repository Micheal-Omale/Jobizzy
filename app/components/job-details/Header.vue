<script setup lang="ts">
import { computed } from "vue";
import type { Job } from "~~/types";

type Props = {
  job: Job;
};

const props = defineProps<Props>();

const matchScore = computed<number>(() => props.job.match_score ?? 0);

// Header match pill uses the v2 tier system: 90+ good (green), 80-89 info (blue),
// below 80 fair (amber) — renders the design's blue 85% pill.
const tier = computed<"good" | "info" | "fair">(() => {
  if (matchScore.value >= 90) return "good";
  if (matchScore.value >= 80) return "info";
  return "fair";
});

const pillClass = computed<string>(() => {
  const map: Record<string, string> = {
    good: "bg-good-soft text-good-ink",
    info: "bg-info-soft text-info-ink",
    fair: "bg-fair-soft text-fair-ink",
  };
  return map[tier.value]!;
});

const dotClass = computed<string>(() => {
  const map: Record<string, string> = {
    good: "bg-good",
    info: "bg-info",
    fair: "bg-fair",
  };
  return map[tier.value]!;
});

const jobPostUrl = computed<string | null>(
  () => props.job.external_apply_url ?? props.job.source_url ?? null,
);
</script>

<template>
  <div class="jz-frame-lg flex flex-wrap items-center gap-5 rounded-[14px] bg-surface p-6">
    <div class="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[13px] border-2 border-border bg-surface-2 text-text-2">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        <path d="M9 9h.01M12 9h.01M15 9h.01M9 13h.01M12 13h.01M15 13h.01" />
      </svg>
    </div>

    <div class="min-w-[200px] flex-1">
      <h1 class="font-display text-[30px] font-bold tracking-[-0.03em] text-text">
        {{ job.title ?? "—" }}
      </h1>
      <div class="mt-[7px] flex flex-wrap items-center gap-[11px]">
        <span class="text-[15px] font-medium text-text-2">{{ job.company ?? "—" }}</span>
        <span
          class="inline-flex items-center gap-1.5 rounded-[7px] border-2 border-border px-2.5 py-1 text-[12.5px] font-bold"
          :class="pillClass"
        >
          <span class="h-[7px] w-[7px] rounded-full border-[1.5px] border-border" :class="dotClass"></span>
          {{ matchScore }}% Match Score
        </span>
      </div>
    </div>

    <a
      v-if="jobPostUrl"
      :href="jobPostUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="jz-frame jz-press inline-flex shrink-0 items-center gap-2.5 rounded-[9px] bg-surface-2 px-[17px] py-[11px] text-[14px] font-semibold text-text"
    >
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M14 4h6v6M20 4l-9 9M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1v-4" />
      </svg>
      View Job Post
    </a>
  </div>
</template>
