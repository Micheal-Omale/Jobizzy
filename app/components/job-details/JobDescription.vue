<script setup lang="ts">
import { computed } from "vue";
import type { Job } from "~~/types";

type Props = {
  job: Job;
};

const props = defineProps<Props>();

const description = computed<string | null>(() => props.job.about_role);

// Adzuna's search API only returns a truncated snippet (it ends in an ellipsis),
// not the full posting. When the stored text is truncated, point the user to the
// original posting for the rest rather than leaving a sentence hanging.
const isTruncated = computed<boolean>(() => {
  const text = description.value?.trimEnd() ?? "";
  return text.endsWith("…") || text.endsWith("...");
});

const postingUrl = computed<string | null>(
  () => props.job.external_apply_url ?? props.job.source_url ?? null,
);
</script>

<template>
  <div class="jz-frame rounded-[14px] bg-surface p-6">
    <div class="mb-3.5 flex items-center gap-2.5">
      <span class="flex h-[30px] w-[30px] items-center justify-center rounded-lg border-2 border-border bg-surface-sunk text-text-2">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6M9 13h6M9 17h6" />
        </svg>
      </span>
      <h2 class="font-display text-[18px] font-bold text-text">Job Description</h2>
    </div>
    <p class="whitespace-pre-line text-[15px] leading-[1.7] text-text-2">
      {{ description ?? "No job description available." }}
    </p>

    <div
      v-if="isTruncated && postingUrl"
      class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t-2 border-border-soft pt-4 text-[13px]"
    >
      <span class="text-text-3">This is a preview from the job board.</span>
      <a
        :href="postingUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 font-semibold text-accent-ink hover:text-accent"
      >
        Read the full description
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
      </a>
    </div>
  </div>
</template>
