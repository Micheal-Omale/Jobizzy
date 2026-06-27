<script setup lang="ts">
definePageMeta({
  layout: "default",
});

// Load the user's data once auth resolves so the stats, recent activity, and
// charts show real values. Auth is client-side, so SSR renders skeletons and the
// client hydrates. Stats and charts both derive from the job list; activity also
// needs agent_runs. refreshStats already refreshes the shared job list, so the
// charts (derived from the same list) need no separate fetch.
const { user, ensureLoaded } = useAuth();
const { fetchProfile } = useProfile();
const { refresh: refreshStats } = useDashboardStats();
const { refresh: refreshActivity } = useRecentActivity();
const { data: analytics, loaded: analyticsLoaded } = useDashboardAnalytics();

// Charts show their skeleton until the job list has loaded, then either the chart
// or its empty state — same pattern as Recent Activity / Stats.
const chartsLoading = computed(() => !analyticsLoaded.value);

// First name for the greeting: prefer the saved profile, fall back to the email
// local-part, then a neutral default — so the header always reads naturally.
const firstName = ref("");
const greeting = computed(() => (firstName.value ? `Welcome back, ${firstName.value}` : "Welcome back"));

function deriveFirstName(fullName?: string | null, email?: string | null): string {
  const fromName = fullName?.trim().split(/\s+/)[0];
  if (fromName) return fromName;
  const local = email?.split("@")[0];
  if (local) return local.charAt(0).toUpperCase() + local.slice(1);
  return "";
}

onMounted(async () => {
  await ensureLoaded();
  const [profileResult] = await Promise.all([
    fetchProfile(),
    refreshStats(),
    refreshActivity(),
  ]);
  firstName.value = deriveFirstName(
    profileResult.success ? profileResult.data?.full_name : null,
    user.value?.email,
  );
});
</script>

<template>
  <div class="mx-auto max-w-[1240px] px-7 pt-[38px] pb-16">
    <!-- Header -->
    <div class="mb-[26px] flex flex-wrap items-end justify-between gap-[14px]">
      <div>
        <h1 class="font-display text-[36px] font-bold tracking-[-0.03em] text-text">{{ greeting }}</h1>
        <p class="mt-1.5 text-[15px] text-text-2">Here's what your copilot found this week.</p>
      </div>
      <NuxtLink
        to="/find-jobs"
        class="jz-frame jz-press rounded-[9px] bg-accent px-[18px] py-[11px] text-[14px] font-semibold text-white"
      >
        + Find new jobs
      </NuxtLink>
    </div>

    <!-- Stats -->
    <DashboardStatsBar />

    <!-- Activity + research -->
    <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.35fr]">
      <DashboardRecentActivity />
      <DashboardCompanyResearchChart :data="analytics.companyResearch" :loading="chartsLoading" />
    </div>

    <!-- Charts row -->
    <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
      <DashboardJobsFoundChart :data="analytics.jobsFound" :loading="chartsLoading" />
      <DashboardMatchScoreChart :data="analytics.matchDistribution" :loading="chartsLoading" />
    </div>
  </div>
</template>
