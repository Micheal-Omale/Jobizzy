<script setup lang="ts">
import type { ChartPoint } from "~~/types";
import { niceChartMax, axisTicks } from "~~/lib/utils";

// Wired to PostHog job_found events (feature 17) via useDashboardAnalytics.
const props = defineProps<{
  data: ChartPoint[];
  loading?: boolean;
}>();

const isEmpty = computed(
  () => props.data.length === 0 || props.data.every((d) => d.value === 0),
);

const max = computed(() => niceChartMax(props.data.map((d) => d.value)));
const yTicks = computed(() => axisTicks(max.value));

const points = computed(() => {
  const slotWidth = 100 / Math.max(1, props.data.length);
  return props.data.map((d, i) => ({
    label: d.label,
    x: (i + 0.5) * slotWidth,
    y: 100 - (d.value / max.value) * 100,
  }));
});

function buildLinePath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  let path = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const current = pts[i]!;
    const next = pts[i + 1]!;
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

const linePath = computed(() => buildLinePath(points.value));
const areaPath = computed(() => {
  const pts = points.value;
  if (pts.length === 0) return "";
  return `${linePath.value} L ${pts[pts.length - 1]!.x} 100 L ${pts[0]!.x} 100 Z`;
});
const gridLines = computed(() => yTicks.value.map((t) => 100 - (t / max.value) * 100));
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <h2 class="text-[16px] font-semibold leading-6 text-text-primary">Jobs Found Over Time</h2>

    <div v-if="loading" class="mt-6 h-[244px] w-full animate-pulse rounded-lg bg-surface-secondary"></div>

    <div
      v-else-if="isEmpty"
      class="mt-6 flex h-[244px] flex-col items-center justify-center gap-1 text-center"
    >
      <p class="text-[14px] font-medium text-text-secondary">No data yet</p>
      <p class="max-w-xs text-[13px] leading-5 text-text-muted">
        Run a job search and your activity will chart here.
      </p>
    </div>

    <div v-else class="mt-6 flex flex-1 gap-3">
      <div
        class="flex w-7 flex-col justify-between py-1 text-right text-[11px] leading-none text-text-muted"
      >
        <span v-for="t in yTicks" :key="t">{{ t }}</span>
      </div>
      <div class="flex flex-1 flex-col">
        <div class="h-[220px] w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="h-full w-full">
            <defs>
              <linearGradient id="jobsFoundFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.25" />
                <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0" />
              </linearGradient>
            </defs>
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
            <path :d="areaPath" fill="url(#jobsFoundFill)" />
            <path
              :d="linePath"
              fill="none"
              stroke="var(--color-accent)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div class="mt-2 flex">
          <span
            v-for="point in points"
            :key="point.label"
            class="flex-1 text-center text-[11px] text-text-muted"
          >
            {{ point.label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
