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
  <div
    class="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <h2 class="mb-4 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
      Required Skills vs Your Profile
    </h2>

    <p v-if="!hasSkills" class="text-[14px] text-text-secondary">
      No skill comparison available for this job yet.
    </p>

    <template v-else>
      <div v-if="matchedSkills.length" class="mb-5">
        <p class="mb-2 text-[12px] font-medium text-text-secondary">You have</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in matchedSkills"
            :key="skill"
            class="inline-flex items-center gap-1.5 rounded-full bg-success-lightest px-3 py-1 text-[12px] font-medium text-success-foreground"
          >
            <svg
              class="h-3 w-3 text-success"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {{ skill }}
          </span>
        </div>
      </div>

      <div v-if="missingSkills.length">
        <p class="mb-2 text-[12px] font-medium text-text-secondary">Gap skills</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in missingSkills"
            :key="skill"
            class="inline-flex items-center gap-1.5 rounded-full bg-warning-light px-3 py-1 text-[12px] font-medium text-warning-dark"
          >
            <svg
              class="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            {{ skill }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
