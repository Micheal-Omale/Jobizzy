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
  <div>
    <div class="mx-auto max-w-[920px] px-7 pt-[34px] pb-[120px]">
      <NuxtLink
        to="/find-jobs"
        class="mb-5 inline-flex w-fit items-center gap-[7px] text-[14px] font-semibold text-text-2 hover:text-accent-ink"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Jobs
      </NuxtLink>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col gap-[18px]">
        <div class="jz-frame h-28 animate-pulse rounded-[14px] bg-surface-sunk" />
        <div class="jz-frame h-20 animate-pulse rounded-[14px] bg-surface-sunk" />
        <div class="jz-frame h-40 animate-pulse rounded-[14px] bg-surface-sunk" />
      </div>

      <!-- Not found -->
      <div
        v-else-if="!job"
        class="jz-frame-lg rounded-[14px] bg-surface p-6 text-center"
      >
        <p class="font-display text-[18px] font-bold text-text">Job not found</p>
        <p class="mt-1.5 text-[14px] text-text-2">
          This job doesn't exist or isn't in your list.
        </p>
      </div>

      <!-- Job details -->
      <div v-else class="flex flex-col gap-[18px]">
        <JobDetailsHeader :job="job" />
        <JobDetailsInfoCards :job="job" />
        <JobDetailsMatchReasoning :job="job" />
        <JobDetailsSkillsComparison :job="job" />
        <JobDetailsJobDescription :job="job" />
        <JobDetailsCompanyResearch :job="job" />
      </div>
    </div>

    <!-- Sticky apply bar -->
    <div
      v-if="!loading && job"
      class="sticky bottom-0 z-40 border-t-2 border-border bg-surface"
    >
      <div class="mx-auto max-w-[920px] px-7 py-3.5">
        <a
          v-if="applyUrl"
          :href="applyUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="jz-frame jz-press block w-full rounded-[11px] bg-accent px-6 py-[15px] text-center font-display text-[16px] font-bold text-white"
        >
          Apply Now{{ job.company ? ` at ${job.company}` : "" }} →
        </a>
        <button
          v-else
          type="button"
          disabled
          class="block w-full cursor-not-allowed rounded-[11px] border-2 border-border bg-accent px-6 py-[15px] text-center font-display text-[16px] font-bold text-white opacity-60"
        >
          Apply Now
        </button>
      </div>
    </div>
  </div>
</template>
