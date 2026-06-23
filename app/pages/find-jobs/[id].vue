<script setup lang="ts">
import { useRoute } from "vue-router";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const jobId = computed<string>(() => String(route.params.id));
</script>

<template>
  <PagePlaceholder
    title="Job Details"
    :description="`Full job details, match reasoning, required-vs-your skills, and company research for job ${jobId} will live here.`"
    note="Build plan: feature 12 (Phase 4)."
  />
</template>
