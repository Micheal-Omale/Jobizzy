<script setup lang="ts">
const { activities, loaded } = useRecentActivity();

// Two entry types, two dot colors (build-plan feature 16): a completed search is a
// "job found" → green; a company-research dossier → info blue. v2 tier tokens.
const dotClass: Record<"search" | "research", string> = {
  search: "bg-good",
  research: "bg-info",
};
</script>

<template>
  <section class="jz-frame flex flex-col rounded-[13px] bg-surface p-[22px]">
    <h2 class="mb-[18px] font-display text-[18px] font-bold text-text">Recent Activity</h2>

    <div v-if="!loaded" class="flex flex-col">
      <div v-for="n in 5" :key="n" class="flex gap-[13px] pb-4">
        <div class="flex flex-col items-center">
          <span class="h-3 w-3 shrink-0 animate-pulse rounded-full bg-surface-sunk"></span>
          <span v-if="n < 5" class="mt-1 w-[2px] flex-1 bg-border-soft"></span>
        </div>
        <div class="flex-1">
          <div class="h-3.5 w-2/3 animate-pulse rounded bg-surface-sunk"></div>
          <div class="mt-1.5 h-3 w-20 animate-pulse rounded bg-surface-sunk"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="activities.length === 0"
      class="flex flex-1 flex-col items-center justify-center gap-1 py-10 text-center"
    >
      <p class="text-[14px] font-medium text-text-2">No activity yet</p>
      <p class="max-w-xs text-[13px] leading-5 text-text-3">
        Your job searches and company research will show up here.
      </p>
    </div>

    <div v-else class="flex flex-col">
      <div
        v-for="(activity, i) in activities"
        :key="activity.id"
        class="flex gap-[13px]"
        :class="i < activities.length - 1 ? 'pb-4' : ''"
      >
        <div class="flex flex-col items-center">
          <span
            class="h-3 w-3 shrink-0 rounded-full border-2 border-border"
            :class="dotClass[activity.type]"
          ></span>
          <span
            v-if="i < activities.length - 1"
            class="mt-1 w-[2px] flex-1 bg-border-soft"
          ></span>
        </div>
        <div>
          <div class="text-[14px] font-semibold text-text">{{ activity.text }}</div>
          <div class="mt-0.5 font-mono text-[11.5px] text-text-3">{{ activity.time }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
