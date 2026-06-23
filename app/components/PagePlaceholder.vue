<script setup lang="ts">
type Props = {
  title: string;
  description: string;
  note?: string;
};

defineProps<Props>();
</script>

<template>
  <div class="min-h-[60vh] w-full border-x border-border bg-surface px-6 py-12 md:px-8">
    <div class="mx-auto max-w-[1160px]">
      <h1 class="text-[30px] font-semibold leading-9 text-text-primary">{{ title }}</h1>

      <div
        class="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
      >
        <h2 class="text-[16px] font-semibold leading-6 text-text-primary">Coming soon</h2>
        <p class="mt-2 max-w-xl text-[14px] leading-5 text-text-secondary">{{ description }}</p>
        <p v-if="note" class="mt-3 text-[12px] leading-4 text-text-muted">{{ note }}</p>
      </div>
    </div>
  </div>
</template>
