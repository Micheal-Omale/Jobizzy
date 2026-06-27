<script setup lang="ts">
import { computed } from "vue";
import type { Job } from "~~/types";
import { formatRelativeTime } from "~~/lib/utils";

type Props = {
  job: Job;
};

const props = defineProps<Props>();

// Adzuna contract types come through as compact tokens (e.g. "fulltime"); make
// them readable, and fall back to an em dash when unknown.
const jobType = computed<string>(() => {
  const raw = props.job.job_type;
  if (!raw) return "—";
  const map: Record<string, string> = {
    fulltime: "Full-time",
    parttime: "Part-time",
    contract: "Contract",
    permanent: "Permanent",
  };
  return map[raw] ?? raw.charAt(0).toUpperCase() + raw.slice(1);
});

const cardClass = "jz-frame flex items-center gap-3 rounded-[12px] bg-surface p-4";
const chipClass = "flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] border-2 border-border";
const valueClass = "truncate font-display text-[15px] font-bold text-text";
const labelClass = "mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-text-3";
</script>

<template>
  <div class="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
    <div :class="cardClass">
      <span :class="[chipClass, 'bg-good-soft text-good-ink']">
        <span class="text-[15px] font-bold">$</span>
      </span>
      <div class="min-w-0">
        <p :class="valueClass">{{ job.salary ?? "—" }}</p>
        <p :class="labelClass">Salary Est.</p>
      </div>
    </div>

    <div :class="cardClass">
      <span :class="[chipClass, 'bg-info-soft text-info-ink']">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </span>
      <div class="min-w-0">
        <p :class="valueClass">{{ job.location ?? "—" }}</p>
        <p :class="labelClass">Location</p>
      </div>
    </div>

    <div :class="cardClass">
      <span :class="[chipClass, 'bg-accent-soft text-accent-ink']">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </span>
      <div class="min-w-0">
        <p :class="valueClass">{{ jobType }}</p>
        <p :class="labelClass">Job Type</p>
      </div>
    </div>

    <div :class="cardClass">
      <span :class="[chipClass, 'bg-surface-sunk text-text-2']">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
      </span>
      <div class="min-w-0">
        <p :class="valueClass">{{ formatRelativeTime(job.found_at) }}</p>
        <p :class="labelClass">Date Found</p>
      </div>
    </div>
  </div>
</template>
