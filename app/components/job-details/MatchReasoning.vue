<script setup lang="ts">
import type { Job } from "~~/types";

type Props = {
  job: Job;
};

defineProps<Props>();
</script>

<template>
  <div class="jz-frame rounded-[14px] bg-surface p-6">
    <div class="mb-3.5 flex items-center gap-2.5">
      <span class="flex h-[30px] w-[30px] items-center justify-center rounded-lg border-2 border-border bg-good-soft text-good-ink">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3l1.8 4.6L18.5 9l-4.6 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.4z" />
        </svg>
      </span>
      <h2 class="font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-good-ink">
        AI Match Reasoning
      </h2>
    </div>
    <p class="text-[15.5px] leading-[1.65] text-text">
      {{ job.match_reason ?? "No match reasoning available for this job yet." }}
    </p>
  </div>
</template>
