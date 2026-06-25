<script setup lang="ts">
import { computed } from "vue";

type Props = {
  score: number;
};

const props = defineProps<Props>();

// Thresholds read off the design: 90+ green, 80-89 blue, below 80 orange.
const barColor = computed<string>(() => {
  if (props.score >= 90) return "bg-success";
  if (props.score >= 80) return "bg-info";
  return "bg-warning";
});
</script>

<template>
  <div class="flex items-center gap-2.5">
    <div class="h-1.5 w-16 overflow-hidden rounded-full bg-border-light">
      <div class="h-full rounded-full" :class="barColor" :style="{ width: `${score}%` }" />
    </div>
    <span class="text-[14px] font-semibold text-text-primary">{{ score }}%</span>
  </div>
</template>
