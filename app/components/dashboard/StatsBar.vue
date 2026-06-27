<script setup lang="ts">
const { stats, loaded } = useDashboardStats();
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <template v-if="loaded">
      <DashboardStatCard
        v-for="(stat, i) in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :note="stat.note"
        :trend="stat.trend"
        :trend-positive="stat.trendPositive"
        :accent="i === stats.length - 1"
      />
    </template>
    <template v-else>
      <div
        v-for="n in 4"
        :key="n"
        class="jz-frame h-[124px] animate-pulse rounded-[13px] bg-surface-sunk"
      ></div>
    </template>
  </div>
</template>
