<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const { isAuthenticated, signOut } = useAuth();
const { track } = useAnalytics();
const { isDark, toggle } = useTheme();

const signingOut = ref(false);

async function handleSignOut(): Promise<void> {
  if (signingOut.value) return;
  signingOut.value = true;
  await signOut();
  signingOut.value = false;
}

const ctaTarget = computed<string>(() => (isAuthenticated.value ? "/dashboard" : "/login"));
const ctaLabel = computed<string>(() => (isAuthenticated.value ? "Go to Dashboard" : "Start free"));

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/find-jobs", label: "Find Jobs" },
  { to: "/profile", label: "Profile" },
];

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(`${to}/`);
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b-2 border-border bg-surface">
    <div class="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-7">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-[11px]">
        <span
          class="jz-frame-sm flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 13l7-7 7 7" />
            <path d="M5 19l7-7 7 7" />
          </svg>
        </span>
        <span class="font-display text-[21px] font-bold tracking-[-0.03em] text-text">Jobizzy</span>
      </NuxtLink>

      <!-- Right cluster -->
      <div class="flex items-center gap-1.5">
        <nav class="hidden items-center gap-1.5 md:flex">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="relative px-3.5 py-2 text-[14px] font-semibold"
            :class="isActive(link.to) ? 'text-accent-ink' : 'text-text-2 hover:text-text'"
          >
            {{ link.label }}
            <span
              v-if="isActive(link.to)"
              class="absolute inset-x-3.5 -bottom-px h-[3px] rounded-[3px] bg-accent"
            />
          </NuxtLink>
        </nav>

        <!-- Theme toggle -->
        <button
          type="button"
          class="jz-frame-sm jz-press-sm ml-2 flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-surface-2"
          title="Toggle theme"
          aria-label="Toggle theme"
          @click="toggle"
        >
          <ClientOnly>
            <span class="text-[16px]">{{ isDark ? "☀️" : "🌙" }}</span>
            <template #fallback>
              <span class="text-[16px]">🌙</span>
            </template>
          </ClientOnly>
        </button>

        <!-- Sign out — only when authenticated. The redesigned app pages carry no
             sign-out of their own, so this is the single exit from the UI. -->
        <ClientOnly>
          <button
            v-if="isAuthenticated"
            type="button"
            class="jz-frame-sm jz-press-sm ml-1 flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
            title="Sign out"
            aria-label="Sign out"
            :disabled="signingOut"
            @click="handleSignOut"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-text-2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </ClientOnly>

        <!-- CTA — auth-aware, resolved client-side to avoid hydration mismatch -->
        <ClientOnly>
          <NuxtLink
            :to="ctaTarget"
            class="jz-frame jz-press ml-1 rounded-[9px] bg-accent px-4 py-[9px] text-[14px] font-semibold text-white"
            @click="track('cta_clicked', { location: 'navbar', label: ctaLabel, target: ctaTarget })"
          >
            {{ ctaLabel }}
          </NuxtLink>
          <template #fallback>
            <span
              class="ml-1 inline-block h-[40px] w-[104px] animate-pulse rounded-[9px] bg-accent/40"
              aria-hidden="true"
            />
          </template>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>
