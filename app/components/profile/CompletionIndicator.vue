<script setup lang="ts">
import { computed } from "vue";

type Props = {
  percentage: number;
  missingFields: string[];
};

const props = defineProps<Props>();

const RADIUS = 40;
const circumference = 2 * Math.PI * RADIUS;

const clampedPercentage = computed<number>(() =>
  Math.min(Math.max(props.percentage, 0), 100),
);

const dashOffset = computed<number>(
  () => circumference * (1 - clampedPercentage.value / 100),
);
</script>

<template>
  <div class="rounded-2xl border border-error-light bg-error-lightest p-6">
    <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5 text-error"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 class="text-[16px] font-semibold leading-6 text-text-primary">
            Profile needs attention
          </h2>
        </div>

        <p class="mt-1.5 max-w-xl text-[14px] leading-5 text-text-secondary">
          Complete the missing fields to improve your chance of getting tailored
          matches and generating quality resumes.
        </p>

        <div v-if="missingFields.length" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="field in missingFields"
            :key="field"
            class="rounded-full bg-error-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-error"
          >
            {{ field }}
          </span>
        </div>
      </div>

      <div class="relative h-[88px] w-[88px] shrink-0">
        <svg class="h-full w-full -rotate-90" viewBox="0 0 88 88">
          <circle
            cx="44"
            cy="44"
            :r="RADIUS"
            fill="none"
            stroke="var(--color-border-light)"
            stroke-width="8"
          />
          <circle
            cx="44"
            cy="44"
            :r="RADIUS"
            fill="none"
            stroke="var(--color-error)"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-[20px] font-bold text-error">{{ clampedPercentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
