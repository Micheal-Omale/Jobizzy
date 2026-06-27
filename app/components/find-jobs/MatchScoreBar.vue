<script setup lang="ts">
import { computed } from "vue";

type Props = {
  score: number;
};

const props = defineProps<Props>();

// v2 tier system (design): 90+ green (good), 80-89 blue (info), below 80 amber (fair).
const fillClass = computed<string>(() => {
  if (props.score >= 90) return "bg-good";
  if (props.score >= 80) return "bg-info";
  return "bg-fair";
});

const textClass = computed<string>(() => {
  if (props.score >= 90) return "text-good-ink";
  if (props.score >= 80) return "text-info-ink";
  return "text-fair-ink";
});
</script>

<template>
  <div class="flex items-center gap-[11px]">
    <span class="h-[13px] w-[90px] overflow-hidden rounded-[7px] border-2 border-border bg-surface-2">
      <span class="block h-full" :class="fillClass" :style="{ width: `${score}%` }" />
    </span>
    <b class="font-display text-[17px]" :class="textClass">{{ score }}%</b>
  </div>
</template>
