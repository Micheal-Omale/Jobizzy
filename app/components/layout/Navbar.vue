<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const { isAuthenticated } = useAuth();
const { track } = useAnalytics();

const ctaTarget = computed<string>(() => (isAuthenticated.value ? "/dashboard" : "/login"));
const ctaLabel = computed<string>(() => (isAuthenticated.value ? "Go to Dashboard" : "Start for free"));
</script>

<template>
  <header class="h-20 w-full bg-surface px-6 border-b border-border md:px-8">
    <div class="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between">
    <NuxtLink to="/" class="flex items-center">
      <img src="/public/logo.png" alt="JobPilot" class="h-9 w-auto" />
    </NuxtLink>

    <nav class="hidden items-center gap-11 md:flex">
      <NuxtLink 
        to="/dashboard" 
        class="text-[16px] font-medium"
        :class="route.path === '/dashboard' ? 'text-accent' : 'text-text-dark hover:text-text-primary'"
      >
        Dashboard
      </NuxtLink>
      <NuxtLink 
        to="/find-jobs" 
        class="text-[16px] font-medium"
        :class="route.path === '/find-jobs' ? 'text-accent' : 'text-text-dark hover:text-text-primary'"
      >
        Find Jobs
      </NuxtLink>
      <NuxtLink 
        to="/profile" 
        class="text-[16px] font-medium"
        :class="route.path === '/profile' ? 'text-accent' : 'text-text-dark hover:text-text-primary'"
      >
        Profile
      </NuxtLink>
    </nav>

    <!-- Auth state is resolved client-side only, so the CTA must render on the
         client to avoid an SSR hydration mismatch. The fallback keeps the
         button's footprint stable until the real label/target are known. -->
    <ClientOnly>
      <NuxtLink
        :to="ctaTarget"
        class="rounded-md bg-text-slate px-5 py-3 text-[15px] font-medium text-surface transition-colors hover:bg-overlay"
        @click="track('cta_clicked', { location: 'navbar', label: ctaLabel, target: ctaTarget })"
      >
        {{ ctaLabel }}
      </NuxtLink>
      <template #fallback>
        <span
          class="inline-block h-[44px] w-[120px] animate-pulse rounded-md bg-overlay/40"
          aria-hidden="true"
        />
      </template>
    </ClientOnly>
    </div>
  </header>
</template>
