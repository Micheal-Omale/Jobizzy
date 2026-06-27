<script setup lang="ts">
definePageMeta({
  layout: "default",
});

// Load the user's saved jobs into the shared list once auth is resolved, so the
// table shows real data on arrival (the search controls refresh it after a run).
const { ensureLoaded } = useAuth();
const { refresh } = useJobs();

onMounted(async () => {
  await ensureLoaded();
  await refresh();
});
</script>

<template>
  <div class="mx-auto max-w-[1240px] px-7 pt-[38px] pb-16">
    <h1 class="mb-[22px] font-display text-[36px] font-bold tracking-[-0.03em] text-text">Find Jobs</h1>

    <FindJobsSearchControls />
    <div class="mt-[18px]">
      <FindJobsFilters />
    </div>
    <div class="mt-[18px]">
      <FindJobsTable />
    </div>
  </div>
</template>
