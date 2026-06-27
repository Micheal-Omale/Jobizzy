<script setup lang="ts">
import { computed } from "vue";
import type { Job } from "~~/types";

type Props = {
  job: Job;
};

const props = defineProps<Props>();

const matchedSkills = computed<string[]>(() => props.job.matched_skills ?? []);
const missingSkills = computed<string[]>(() => props.job.missing_skills ?? []);
const hasSkills = computed<boolean>(
  () => matchedSkills.value.length > 0 || missingSkills.value.length > 0,
);
</script>

<template>
  <div class="jz-frame rounded-[14px] bg-surface p-6">
    <h2 class="mb-[18px] font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-text-2">
      Required Skills vs Your Profile
    </h2>

    <p v-if="!hasSkills" class="text-[14px] text-text-2">
      No skill comparison available for this job yet.
    </p>

    <template v-else>
      <div v-if="matchedSkills.length" class="mb-1">
        <div class="mb-2.5 flex items-center gap-2">
          <span class="flex h-5 w-5 items-center justify-center rounded-md border-2 border-border bg-good">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12l5 5L19 7" />
            </svg>
          </span>
          <span class="text-[13.5px] font-bold text-good-ink">You have</span>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <span
            v-for="skill in matchedSkills"
            :key="skill"
            class="rounded-lg border-2 border-border bg-good-soft px-[13px] py-[7px] text-[13px] font-semibold text-good-ink"
          >
            ✓ {{ skill }}
          </span>
        </div>
      </div>

      <div v-if="missingSkills.length" :class="matchedSkills.length ? 'mt-5' : ''">
        <div class="mb-2.5 flex items-center gap-2">
          <span class="flex h-5 w-5 items-center justify-center rounded-md border-2 border-border bg-fair">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
          <span class="text-[13.5px] font-bold text-fair-ink">Gap skills</span>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <span
            v-for="skill in missingSkills"
            :key="skill"
            class="rounded-lg border-2 border-border bg-fair-soft px-[13px] py-[7px] text-[13px] font-semibold text-fair-ink"
          >
            ✕ {{ skill }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
