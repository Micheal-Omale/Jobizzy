<script setup lang="ts">
const footerLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "#", label: "Privacy Policy" },
  { to: "#", label: "Terms & Conditions" },
];
</script>

<template>
  <footer class="w-full border-t-2 border-border bg-surface">
    <div class="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-7 py-[34px]">
      <NuxtLink to="/" class="flex items-center gap-[11px]">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-[9px] border-2 border-border bg-accent"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 13l7-7 7 7" />
            <path d="M5 19l7-7 7 7" />
          </svg>
        </span>
        <span class="font-display text-[18px] font-bold tracking-[-0.03em] text-text">Jobizzy</span>
      </NuxtLink>

      <div class="flex items-center gap-6">
        <NuxtLink
          v-for="link in footerLinks"
          :key="link.label"
          :to="link.to"
          class="text-[13.5px] font-medium text-text-2 hover:text-text"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
