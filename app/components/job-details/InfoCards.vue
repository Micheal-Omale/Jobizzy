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

const cardClass =
  "flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]";
const chipClass = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg";
const valueClass = "truncate text-[14px] font-semibold text-text-primary";
const labelClass = "text-[11px] font-medium uppercase tracking-wide text-text-muted";
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div :class="cardClass">
      <div :class="[chipClass, 'bg-success-lightest text-success']">
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <div class="min-w-0">
        <p :class="valueClass">{{ job.salary ?? "—" }}</p>
        <p :class="labelClass">Salary Est.</p>
      </div>
    </div>

    <div :class="cardClass">
      <div :class="[chipClass, 'bg-info-lightest text-info-dark']">
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
      <div class="min-w-0">
        <p :class="valueClass">{{ job.location ?? "—" }}</p>
        <p :class="labelClass">Location</p>
      </div>
    </div>

    <div :class="cardClass">
      <div :class="[chipClass, 'bg-surface-tertiary text-text-secondary']">
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
      </div>
      <div class="min-w-0">
        <p :class="valueClass">{{ jobType }}</p>
        <p :class="labelClass">Job Type</p>
      </div>
    </div>

    <div :class="cardClass">
      <div :class="[chipClass, 'bg-accent-light text-accent']">
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
      </div>
      <div class="min-w-0">
        <p :class="valueClass">{{ formatRelativeTime(job.found_at) }}</p>
        <p :class="labelClass">Date Found</p>
      </div>
    </div>
  </div>
</template>
