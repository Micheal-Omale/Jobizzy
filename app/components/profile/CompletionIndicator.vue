<script setup lang="ts">
import { computed } from "vue";

type Props = {
  percentage: number;
  missingFields: string[];
};

const props = defineProps<Props>();

const RADIUS = 44;
const circumference = 2 * Math.PI * RADIUS;

const clampedPercentage = computed<number>(() =>
  Math.min(Math.max(props.percentage, 0), 100),
);

const dashOffset = computed<number>(
  () => circumference * (1 - clampedPercentage.value / 100),
);
</script>

<template>
  <div class="jz-frame-lg rounded-[14px] bg-error-soft p-6">
    <div class="flex flex-wrap items-center gap-6">
      <div class="min-w-[260px] flex-1">
        <div class="flex items-center gap-2.5">
          <span class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-error text-[14px] font-extrabold text-white">!</span>
          <h2 class="font-display text-[19px] font-bold text-text">Profile needs attention</h2>
        </div>

        <p class="mt-2 mb-3.5 max-w-xl text-[14.5px] leading-[1.5] text-text-2">
          Complete the missing fields to improve your chance of getting tailored
          matches and generating quality resumes.
        </p>

        <div v-if="missingFields.length" class="flex flex-wrap gap-2">
          <span
            v-for="field in missingFields"
            :key="field"
            class="rounded-[7px] border-2 border-border bg-surface px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-error"
          >
            {{ field }}
          </span>
        </div>
      </div>

      <div class="relative h-[104px] w-[104px] shrink-0">
        <svg class="h-full w-full -rotate-90" viewBox="0 0 104 104">
          <circle cx="52" cy="52" :r="RADIUS" fill="none" stroke="var(--color-surface)" stroke-width="11" />
          <circle
            cx="52"
            cy="52"
            :r="RADIUS"
            fill="none"
            stroke="var(--color-error)"
            stroke-width="11"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="font-display text-[26px] font-bold text-text">{{ clampedPercentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
