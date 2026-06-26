<script setup lang="ts">
type Props = {
  label: string;
  value: string;
  note: string;
  trend?: string;
  trendPositive?: boolean;
};

const props = withDefaults(defineProps<Props>(), { trendPositive: true });

const trendClass = computed(() =>
  props.trendPositive
    ? "bg-success-lightest text-success-darker"
    : "bg-error-lightest text-error",
);
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <span class="text-[14px] font-medium text-text-secondary">{{ label }}</span>
    <span class="text-[30px] font-semibold leading-9 text-text-primary">{{ value }}</span>
    <div class="flex items-center gap-2">
      <span v-if="trend" class="rounded-sm px-2 py-0.5 text-[12px] font-medium" :class="trendClass">
        {{ trend }}
      </span>
      <span class="text-[12px] text-text-muted">{{ note }}</span>
    </div>
  </div>
</template>
