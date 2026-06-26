<script setup lang="ts">
import { useRoute } from "vue-router";
import type { Job } from "~~/types";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const jobId = computed<string>(() => String(route.params.id));

// Auth is resolved client-side, so the job loads on mount (SSR shows the
// skeleton). fetchJob is RLS-scoped to the user — a foreign/missing id is null.
const { ensureLoaded } = useAuth();
const { fetchJob } = useJobs();

const job = ref<Job | null>(null);
const loading = ref(true);

const applyUrl = computed<string | null>(
  () => job.value?.external_apply_url ?? job.value?.source_url ?? null,
);

onMounted(async () => {
  await ensureLoaded();
  job.value = await fetchJob(jobId.value);
  loading.value = false;
});
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] w-full bg-background px-6 py-8 md:px-8">
    <div class="mx-auto flex max-w-[820px] flex-col gap-6">
      <NuxtLink
        to="/find-jobs"
        class="inline-flex w-fit items-center gap-1.5 text-[14px] font-medium text-text-secondary hover:text-text-primary"
      >
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
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Jobs
      </NuxtLink>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col gap-6">
        <div class="h-28 animate-pulse rounded-2xl border border-border bg-surface-secondary" />
        <div class="h-20 animate-pulse rounded-2xl border border-border bg-surface-secondary" />
        <div class="h-40 animate-pulse rounded-2xl border border-border bg-surface-secondary" />
      </div>

      <!-- Not found -->
      <div
        v-else-if="!job"
        class="rounded-2xl border border-border bg-surface p-6 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
      >
        <p class="text-[16px] font-semibold text-text-primary">Job not found</p>
        <p class="mt-1 text-[14px] text-text-secondary">
          This job doesn't exist or isn't in your list.
        </p>
      </div>

      <!-- Job details -->
      <template v-else>
        <JobDetailsHeader :job="job" />
        <JobDetailsInfoCards :job="job" />
        <JobDetailsMatchReasoning :job="job" />
        <JobDetailsSkillsComparison :job="job" />
        <JobDetailsJobDescription :job="job" />
        <JobDetailsCompanyResearch :job="job" />

        <a
          v-if="applyUrl"
          :href="applyUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-[15px] font-semibold text-accent-foreground hover:bg-accent-dark"
        >
          Apply Now{{ job.company ? ` at ${job.company}` : "" }}
        </a>
        <button
          v-else
          type="button"
          disabled
          class="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-[15px] font-semibold text-accent-foreground opacity-60"
        >
          Apply Now
        </button>
      </template>
    </div>
  </div>
</template>
