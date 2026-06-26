<script setup lang="ts">
definePageMeta({
  layout: "default",
});

// Load the user's data once auth resolves so the stats, recent activity, and
// charts show real values. Auth is client-side, so SSR renders skeletons and the
// client hydrates. Stats and charts both derive from the job list; activity also
// needs agent_runs. refreshStats already refreshes the shared job list, so the
// charts (derived from the same list) need no separate fetch.
const { ensureLoaded } = useAuth();
const { refresh: refreshStats } = useDashboardStats();
const { refresh: refreshActivity } = useRecentActivity();
const { data: analytics, loaded: analyticsLoaded } = useDashboardAnalytics();

// Charts show their skeleton until the job list has loaded, then either the chart
// or its empty state — same pattern as Recent Activity / Stats.
const chartsLoading = computed(() => !analyticsLoaded.value);

onMounted(async () => {
  await ensureLoaded();
  await Promise.all([refreshStats(), refreshActivity()]);
});
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] w-full bg-background px-6 py-8 md:px-8">
    <div class="mx-auto flex max-w-[1160px] flex-col gap-6">
      <DashboardStatsBar />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <DashboardRecentActivity class="lg:col-span-2" />
        <DashboardCompanyResearchChart
          class="lg:col-span-3"
          :data="analytics.companyResearch"
          :loading="chartsLoading"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardJobsFoundChart :data="analytics.jobsFound" :loading="chartsLoading" />
        <DashboardMatchScoreChart :data="analytics.matchDistribution" :loading="chartsLoading" />
      </div>
    </div>
  </div>
</template>
