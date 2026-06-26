<script setup lang="ts">
const { activities, loaded } = useRecentActivity();

// Two entry types, two dot colors (build-plan feature 16): a completed search is a
// "job found" → green; a company-research dossier → info blue.
const ringClass: Record<"search" | "research", string> = {
  search: "bg-success-light",
  research: "bg-info-light",
};

const dotClass: Record<"search" | "research", string> = {
  search: "bg-success-alt",
  research: "bg-info",
};
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <h2 class="text-[16px] font-semibold leading-6 text-text-primary">Recent Activity</h2>

    <div v-if="!loaded" class="mt-5 flex flex-col gap-5">
      <div v-for="n in 5" :key="n" class="flex items-center gap-3">
        <div class="h-4 w-4 shrink-0 animate-pulse rounded-full bg-surface-secondary"></div>
        <div class="flex-1">
          <div class="h-3.5 w-2/3 animate-pulse rounded bg-surface-secondary"></div>
          <div class="mt-1.5 h-3 w-20 animate-pulse rounded bg-surface-secondary"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="activities.length === 0"
      class="flex flex-1 flex-col items-center justify-center gap-1 py-10 text-center"
    >
      <p class="text-[14px] font-medium text-text-secondary">No activity yet</p>
      <p class="max-w-xs text-[13px] leading-5 text-text-muted">
        Your job searches and company research will show up here.
      </p>
    </div>

    <ul v-else class="mt-5 flex flex-col gap-5">
      <li v-for="activity in activities" :key="activity.id" class="flex items-start gap-3">
        <span
          class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
          :class="ringClass[activity.type]"
        >
          <span class="h-2 w-2 rounded-full" :class="dotClass[activity.type]"></span>
        </span>
        <div class="flex flex-col gap-0.5">
          <span class="text-[14px] font-medium text-text-primary">{{ activity.text }}</span>
          <span class="text-[12px] text-text-muted">{{ activity.time }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>
