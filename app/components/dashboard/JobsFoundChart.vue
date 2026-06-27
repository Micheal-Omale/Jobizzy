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
    value: d.value,
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

// Hover tracking: a full-height hit-area rect drives this, snapping to the
// nearest point by x. The tooltip is an HTML overlay positioned by % of width.
const activeIndex = ref<number | null>(null);

const active = computed(() =>
  activeIndex.value === null ? null : (points.value[activeIndex.value] ?? null),
);

function onMove(e: MouseEvent) {
  const svg = e.currentTarget as SVGSVGElement;
  const rect = svg.getBoundingClientRect();
  // Map the cursor's screen x into the 0→700 viewBox space.
  const svgX = ((e.clientX - rect.left) / rect.width) * 700;
  let nearest = 0;
  let best = Infinity;
  points.value.forEach((p, i) => {
    const dist = Math.abs(p.x - svgX);
    if (dist < best) {
      best = dist;
      nearest = i;
    }
  });
  activeIndex.value = nearest;
}
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
      <div class="relative">
        <svg
          viewBox="0 0 700 210"
          class="h-auto w-full overflow-visible"
          @mousemove="onMove"
          @mouseleave="activeIndex = null"
        >
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
          <!-- Vertical guide for the snapped point -->
          <line
            v-if="active"
            :x1="active.x"
            :y1="TOP"
            :x2="active.x"
            :y2="BOTTOM"
            stroke="var(--color-accent)"
            stroke-width="1.5"
            stroke-dasharray="3 4"
            class="pointer-events-none"
          />
          <circle
            v-for="(p, i) in points"
            :key="p.label"
            :cx="p.x"
            :cy="p.y"
            :r="i === activeIndex ? 7 : p.isPeak ? 5.5 : 5"
            :fill="i === activeIndex || p.isPeak ? 'var(--color-accent)' : 'var(--color-surface)'"
            stroke="var(--color-border)"
            stroke-width="2.5"
            class="pointer-events-none transition-all"
          />
        </svg>
        <!-- HTML overlay tooltip, positioned by % of the plot width -->
        <div
          v-if="active"
          class="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-[8px] border-2 border-border bg-surface px-2.5 py-1.5 shadow-md"
          :style="{ left: `${(active.x / 700) * 100}%` }"
        >
          <span class="font-mono text-[11px] font-semibold text-text">{{ active.label }}</span>
          <span class="ml-1.5 font-mono text-[11px] text-text-2">{{ active.value }} jobs</span>
        </div>
      </div>
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
