<script setup lang="ts">
type Props = {
  label: string;
  value: string;
  note: string;
  trend?: string;
  trendPositive?: boolean;
  accent?: boolean;
};

const props = withDefaults(defineProps<Props>(), { trendPositive: true, accent: false });

const pillClass = computed(() =>
  props.trendPositive ? "bg-good-soft text-good-ink" : "bg-error-soft text-error",
);
</script>

<template>
  <div
    class="jz-frame rounded-[13px] p-5"
    :class="accent ? 'bg-accent' : 'bg-surface'"
  >
    <div
      class="font-mono text-[11px] uppercase tracking-[0.05em]"
      :class="accent ? 'text-white/85' : 'text-text-3'"
    >
      {{ label }}
    </div>
    <div
      class="mt-1.5 font-display text-[40px] font-bold leading-[1.05]"
      :class="accent ? 'text-white' : 'text-text'"
    >
      {{ value }}
    </div>

    <div
      v-if="trend"
      class="mt-2 inline-flex items-center gap-[5px] rounded-md border-[1.5px] border-border px-2 py-[3px] text-[12px] font-bold"
      :class="pillClass"
    >
      {{ trend }}
      <span aria-hidden="true">{{ trendPositive ? "▲" : "▼" }}</span>
      <span class="font-medium text-text-3">{{ note }}</span>
    </div>
    <div
      v-else
      class="mt-2.5 text-[12px] font-medium"
      :class="accent ? 'text-white/85' : 'text-text-3'"
    >
      {{ note }}
    </div>
  </div>
</template>
