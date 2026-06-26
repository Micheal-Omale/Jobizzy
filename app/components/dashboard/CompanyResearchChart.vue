<script setup lang="ts">
import type { ChartPoint } from "~~/types";
import { niceChartMax, axisTicks } from "~~/lib/utils";

// Wired to PostHog company_researched events (feature 17) via useDashboardAnalytics.
const props = defineProps<{
  data: ChartPoint[];
  loading?: boolean;
}>();

const isEmpty = computed(
  () => props.data.length === 0 || props.data.every((d) => d.value === 0),
);

const max = computed(() => niceChartMax(props.data.map((d) => d.value)));
const yTicks = computed(() => axisTicks(max.value));

const bars = computed(() => {
  const slotWidth = 100 / Math.max(1, props.data.length);
  const barWidth = slotWidth * 0.42;
  return props.data.map((d, i) => ({
    label: d.label,
    width: barWidth,
    x: i * slotWidth + (slotWidth - barWidth) / 2,
    y: 100 - (d.value / max.value) * 100,
    height: (d.value / max.value) * 100,
  }));
});

const gridLines = computed(() => yTicks.value.map((t) => 100 - (t / max.value) * 100));
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <h2 class="text-[16px] font-semibold leading-6 text-text-primary">Company Research Activity</h2>

    <div v-if="loading" class="mt-6 h-[244px] w-full animate-pulse rounded-lg bg-surface-secondary"></div>

    <div
      v-else-if="isEmpty"
      class="mt-6 flex h-[244px] flex-col items-center justify-center gap-1 text-center"
    >
      <p class="text-[14px] font-medium text-text-secondary">No data yet</p>
      <p class="max-w-xs text-[13px] leading-5 text-text-muted">
        Research a company from a job's page to see activity here.
      </p>
    </div>

    <div v-else class="mt-6 flex flex-1 gap-3">
      <div
        class="flex w-5 flex-col justify-between py-1 text-right text-[11px] leading-none text-text-muted"
      >
        <span v-for="t in yTicks" :key="t">{{ t }}</span>
      </div>
      <div class="flex flex-1 flex-col">
        <div class="h-[220px] w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="h-full w-full">
            <line
              v-for="(gy, i) in gridLines"
              :key="i"
              x1="0"
              :y1="gy"
              x2="100"
              :y2="gy"
              stroke="var(--color-border)"
              stroke-width="1"
              stroke-dasharray="3 3"
              vector-effect="non-scaling-stroke"
            />
            <rect
              v-for="bar in bars"
              :key="bar.label"
              :x="bar.x"
              :y="bar.y"
              :width="bar.width"
              :height="bar.height"
              rx="1.2"
              fill="var(--color-info)"
            />
          </svg>
        </div>
        <div class="mt-2 flex">
          <span
            v-for="bar in bars"
            :key="bar.label"
            class="flex-1 text-center text-[11px] text-text-muted"
          >
            {{ bar.label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
