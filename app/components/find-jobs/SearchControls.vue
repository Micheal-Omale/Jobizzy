<script setup lang="ts">
// Wired to the Adzuna find-agent (feature 10). The job table/filters still read
// mock data — populating them from the DB is feature 11.
const labelClass =
  "mb-1.5 block text-[12px] font-medium uppercase tracking-wide text-text-secondary";
const inputClass =
  "w-full rounded-md border border-border bg-surface py-2.5 pl-9 pr-3 text-[14px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60";

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
  <div class="flex flex-col gap-4">
    <div
      class="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
    >
      <div class="flex flex-col gap-4 md:flex-row md:items-end">
        <div class="flex-1">
          <label for="job-title" :class="labelClass">Job Title</label>
          <div class="relative">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
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

        <div class="flex-1">
          <label for="location" :class="labelClass">Location</label>
          <div class="relative">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="location"
              v-model="location"
              type="text"
              placeholder="Remote, New York..."
              :disabled="loading"
              :class="inputClass"
              @keyup.enter="findJobs"
            />
          </div>
        </div>

        <button
          type="button"
          :disabled="loading"
          class="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-[14px] font-medium text-accent-foreground hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          @click="findJobs"
        >
          <svg
            v-if="loading"
            class="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round" />
          </svg>
          <svg
            v-else
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {{ loading ? "Searching…" : "Find Jobs" }}
        </button>
      </div>
    </div>

    <div
      v-if="result"
      role="status"
      class="flex items-center gap-2 rounded-xl border border-success-light bg-success-lightest px-4 py-3 text-[14px] font-medium text-success-foreground"
    >
      <svg
        class="h-4 w-4 shrink-0 text-success"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"
        />
      </svg>
      Found {{ result.count }} {{ result.count === 1 ? "job" : "jobs" }} and saved
      {{ result.strongMatches }} strong {{ result.strongMatches === 1 ? "match" : "matches" }}.
    </div>

    <div
      v-else-if="errorMessage"
      role="alert"
      class="rounded-xl border border-error bg-surface px-4 py-3 text-[14px] font-medium text-error"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
