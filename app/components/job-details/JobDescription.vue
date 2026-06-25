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
  <div
    class="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <div class="mb-3 flex items-center gap-2">
      <svg
        class="h-4 w-4 text-text-secondary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </svg>
      <h2 class="text-[16px] font-semibold leading-6 text-text-primary">Job Description</h2>
    </div>
    <p class="whitespace-pre-line text-[14px] leading-6 text-text-secondary">
      {{ description ?? "No job description available." }}
    </p>

    <div
      v-if="isTruncated && postingUrl"
      class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-4 text-[13px]"
    >
      <span class="text-text-muted">This is a preview from the job board.</span>
      <a
        :href="postingUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 font-medium text-accent hover:text-accent-dark"
      >
        Read the full description
        <svg
          class="h-3.5 w-3.5"
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
      </a>
    </div>
  </div>
</template>
