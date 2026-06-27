<script setup lang="ts">
import type { ChartPoint } from "~~/types";
import { niceChartMax } from "~~/lib/utils";

// Wired to PostHog job_found events (feature 17) via useDashboardAnalytics.
const props = defineProps<{
  data: ChartPoint[];
  loading?: boolean;
}>();

const isEmpty = computed(
  () => props.data.length === 0 || props.data.every((d) => d.value === 0),
);

// Fixed plot box inside the 700×210 viewBox (matches the design's gridlines):
// x spans 30→690, the line sits between y=40 (top) and y=190 (baseline).
const LEFT = 30;
const RIGHT = 690;
const TOP = 40;
const BOTTOM = 190;

const max = computed(() => niceChartMax(props.data.map((d) => d.value)));

const points = computed(() => {
  const n = props.data.length;
  const peak = Math.max(...props.data.map((d) => d.value));
  return props.data.map((d, i) => ({
    label: d.label,
    x: n <= 1 ? (LEFT + RIGHT) / 2 : LEFT + (i / (n - 1)) * (RIGHT - LEFT),
    y: BOTTOM - (d.value / max.value) * (BOTTOM - TOP),
    isPeak: d.value === peak && d.value > 0,
  }));
});

const linePath = computed(() => {
  const pts = points.value;
  if (pts.length === 0) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
});

const areaPath = computed(() => {
  const pts = points.value;
  if (pts.length === 0) return "";
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  return `${linePath.value} L${last.x},${BOTTOM} L${first.x},${BOTTOM} Z`;
});
</script>

<template>
  <section class="jz-frame flex flex-col rounded-[13px] bg-surface p-[22px]">
    <h2 class="mb-[18px] font-display text-[18px] font-bold text-text">Jobs Found Over Time</h2>

    <div v-if="loading" class="h-[224px] w-full animate-pulse rounded-[10px] bg-surface-sunk"></div>

    <div
      v-else-if="isEmpty"
      class="flex h-[224px] flex-col items-center justify-center gap-1 text-center"
    >
      <p class="text-[14px] font-medium text-text-2">No data yet</p>
      <p class="max-w-xs text-[13px] leading-5 text-text-3">
        Run a job search and your activity will chart here.
      </p>
    </div>

    <template v-else>
      <svg viewBox="0 0 700 210" class="h-auto w-full overflow-visible">
        <line x1="30" y1="40" x2="690" y2="40" stroke="var(--color-border-soft)" stroke-width="1.5" stroke-dasharray="4 5" />
        <line x1="30" y1="90" x2="690" y2="90" stroke="var(--color-border-soft)" stroke-width="1.5" stroke-dasharray="4 5" />
        <line x1="30" y1="140" x2="690" y2="140" stroke="var(--color-border-soft)" stroke-width="1.5" stroke-dasharray="4 5" />
        <line x1="30" y1="190" x2="690" y2="190" stroke="var(--color-border)" stroke-width="2" />
        <path :d="areaPath" fill="var(--color-accent-soft)" />
        <path
          :d="linePath"
          fill="none"
          stroke="var(--color-accent)"
          stroke-width="3.5"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <circle
          v-for="p in points"
          :key="p.label"
          :cx="p.x"
          :cy="p.y"
          :r="p.isPeak ? 5.5 : 5"
          :fill="p.isPeak ? 'var(--color-accent)' : 'var(--color-surface)'"
          stroke="var(--color-border)"
          stroke-width="2.5"
        />
      </svg>
      <div class="mt-2 flex justify-between px-1">
        <span
          v-for="p in points"
          :key="p.label"
          class="font-mono text-[11px] text-text-3"
        >
          {{ p.label }}
        </span>
      </div>
    </template>
  </section>
</template>
