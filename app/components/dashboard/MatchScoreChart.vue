<script setup lang="ts">
import type { ChartPoint } from "~~/types";

// Wired to PostHog job_found matchScore buckets (feature 17) via useDashboardAnalytics.
const props = defineProps<{
  data: ChartPoint[];
  loading?: boolean;
}>();

const isEmpty = computed(
  () => props.data.length === 0 || props.data.every((d) => d.value === 0),
);

const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)));

const bars = computed(() =>
  props.data.map((d) => ({
    label: d.label,
    value: d.value,
    height: (d.value / max.value) * 100,
  })),
);

const activeIndex = ref<number | null>(null);
</script>

<template>
  <section class="jz-frame flex flex-col rounded-[13px] bg-surface p-[22px]">
    <h2 class="mb-[22px] font-display text-[18px] font-bold text-text">Match Score Distribution</h2>

    <div v-if="loading" class="h-[224px] w-full animate-pulse rounded-[10px] bg-surface-sunk"></div>

    <div
      v-else-if="isEmpty"
      class="flex h-[224px] flex-col items-center justify-center gap-1 text-center"
    >
      <p class="text-[14px] font-medium text-text-2">No data yet</p>
      <p class="max-w-xs text-[13px] leading-5 text-text-3">
        Scored jobs from your searches will appear here.
      </p>
    </div>

    <div v-else class="flex h-[200px] items-end gap-[11px]">
      <div
        v-for="(bar, i) in bars"
        :key="bar.label"
        class="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
        @mouseenter="activeIndex = i"
        @mouseleave="activeIndex = null"
      >
        <!-- Tooltip above the active bar -->
        <div
          v-if="activeIndex === i"
          class="pointer-events-none absolute bottom-[calc(100%-14px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[8px] border-2 border-border bg-surface px-2.5 py-1.5 shadow-md"
        >
          <span class="font-mono text-[11px] font-semibold text-text">{{ bar.label }}</span>
          <span class="ml-1.5 font-mono text-[11px] text-text-2">{{ bar.value }} jobs</span>
        </div>
        <div
          class="w-full rounded-t-[5px] border-2 border-border bg-good transition-opacity"
          :class="{ 'opacity-70': activeIndex !== null && activeIndex !== i }"
          :style="{ height: `${bar.height}%` }"
        ></div>
        <span class="font-mono text-[9.5px] text-text-3">{{ bar.label }}</span>
      </div>
    </div>
  </section>
</template>
