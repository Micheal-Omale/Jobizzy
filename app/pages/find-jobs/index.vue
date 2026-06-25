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
  <div class="min-h-[calc(100vh-5rem)] w-full bg-background px-6 py-8 md:px-8">
    <div class="mx-auto flex max-w-[1160px] flex-col gap-6">
      <FindJobsSearchControls />
      <div class="flex flex-col gap-4">
        <FindJobsFilters />
        <FindJobsTable />
      </div>
    </div>
  </div>
</template>
