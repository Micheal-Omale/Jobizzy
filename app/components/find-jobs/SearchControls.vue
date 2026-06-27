<script setup lang="ts">
// Wired to the Adzuna find-agent (feature 10); refreshes the shared job list on success.
const labelClass =
  "mb-2 block font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-text-2";
const fieldClass =
  "flex items-center gap-2.5 rounded-[9px] border-2 border-border bg-surface-2 px-3.5 py-3";
const inputClass =
  "w-full bg-transparent text-[14.5px] font-medium text-text placeholder:text-text-3 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const { refresh: refreshJobs } = useJobs();

const jobTitle = ref("");
const location = ref("");
const loading = ref(false);
const result = ref<{ count: number; strongMatches: number } | null>(null);
const errorMessage = ref("");

async function findJobs(): Promise<void> {
  if (loading.value) return;
  if (!jobTitle.value.trim()) {
    errorMessage.value = "Enter a job title to search.";
    result.value = null;
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  result.value = null;
  try {
    result.value = await $fetch<{ count: number; strongMatches: number }>(
      "/api/agent/find",
      {
        method: "POST",
        body: { jobTitle: jobTitle.value, location: location.value },
      },
    );
    // Pull the freshly-saved jobs into the shared list so the table updates.
    await refreshJobs();
  } catch (error) {
    console.error("[find-jobs/SearchControls] findJobs", error);
    const data = (error as { data?: { message?: string; statusMessage?: string } })?.data;
    errorMessage.value =
      data?.message ?? data?.statusMessage ?? "The search could not be completed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="jz-frame-lg rounded-[14px] bg-surface p-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <div>
        <label for="job-title" :class="labelClass">Job Title</label>
        <div :class="fieldClass">
          <svg class="shrink-0 text-text-3" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id="job-title"
            v-model="jobTitle"
            type="text"
            placeholder="Frontend Engineer"
            :disabled="loading"
            :class="inputClass"
            @keyup.enter="findJobs"
          />
        </div>
      </div>

      <div>
        <label for="location" :class="labelClass">Location</label>
        <div :class="fieldClass">
          <svg class="shrink-0 text-text-3" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <input
            id="location"
            v-model="location"
            type="text"
            placeholder="Remote, New York…"
            :disabled="loading"
            :class="inputClass"
            @keyup.enter="findJobs"
          />
        </div>
      </div>

      <button
        type="button"
        :disabled="loading"
        class="jz-frame jz-press flex items-center justify-center gap-2.5 rounded-[9px] bg-accent px-6 py-3 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        @click="findJobs"
      >
        <svg v-if="loading" class="h-[17px] w-[17px] animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        {{ loading ? "Searching…" : "Find Jobs" }}
      </button>
    </div>

    <div
      v-if="result"
      role="status"
      class="mt-4 flex items-center gap-2.5 rounded-[9px] border-2 border-border bg-good-soft px-[15px] py-3 text-[14px] font-semibold text-good-ink"
    >
      <svg class="shrink-0" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3l1.8 4.6L18.5 9l-4.6 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.4z" />
      </svg>
      Found {{ result.count }} {{ result.count === 1 ? "job" : "jobs" }} and saved
      {{ result.strongMatches }} strong {{ result.strongMatches === 1 ? "match" : "matches" }}.
    </div>

    <div
      v-else-if="errorMessage"
      role="alert"
      class="mt-4 rounded-[9px] border-2 border-border bg-error-soft px-[15px] py-3 text-[14px] font-semibold text-error"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
