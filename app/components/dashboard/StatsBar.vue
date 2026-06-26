<script setup lang="ts">
const { stats, loaded } = useDashboardStats();
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <template v-if="loaded">
      <DashboardStatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :note="stat.note"
        :trend="stat.trend"
        :trend-positive="stat.trendPositive"
      />
    </template>
    <template v-else>
      <div
        v-for="n in 4"
        :key="n"
        class="h-[120px] animate-pulse rounded-2xl border border-border bg-surface-secondary"
      ></div>
    </template>
  </div>
</template>
