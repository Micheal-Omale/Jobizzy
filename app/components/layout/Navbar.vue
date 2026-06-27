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
  closeMenu();
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

// Mobile slide-in drawer. Locks body scroll while open and auto-closes on
// navigation so it never lingers after a link is tapped.
const menuOpen = ref(false);

function openMenu(): void {
  menuOpen.value = true;
}

function closeMenu(): void {
  menuOpen.value = false;
}

watch(menuOpen, (open) => {
  if (import.meta.client) {
    document.body.classList.toggle("overflow-hidden", open);
  }
});

watch(() => route.path, closeMenu);

onUnmounted(() => {
  if (import.meta.client) {
    document.body.classList.remove("overflow-hidden");
  }
});
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

        <!-- Desktop action cluster — collapses into the drawer below md -->
        <div class="hidden items-center gap-1.5 md:flex">
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

        <!-- Hamburger — mobile only -->
        <button
          type="button"
          class="jz-frame-sm jz-press-sm flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-surface-2 md:hidden"
          :aria-expanded="menuOpen"
          aria-label="Open menu"
          @click="openMenu"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="text-text">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile slide-in drawer -->
    <Teleport to="body">
      <Transition name="jz-backdrop">
        <div
          v-if="menuOpen"
          class="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[1px] md:hidden"
          @click="closeMenu"
        />
      </Transition>
      <Transition name="jz-drawer">
        <aside
          v-if="menuOpen"
          class="fixed inset-y-0 right-0 z-[70] flex w-[min(82vw,320px)] flex-col border-l-2 border-border bg-surface md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <!-- Drawer header -->
          <div class="flex h-16 items-center justify-between border-b-2 border-border px-6">
            <NuxtLink to="/" class="flex items-center gap-[11px]" @click="closeMenu">
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
            <button
              type="button"
              class="jz-frame-sm jz-press-sm flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-surface-2"
              aria-label="Close menu"
              @click="closeMenu"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="text-text">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>

          <!-- Nav links -->
          <nav class="flex flex-col gap-1 px-4 py-5">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="rounded-[10px] px-4 py-3 text-[16px] font-semibold"
              :class="isActive(link.to) ? 'bg-surface-2 text-accent-ink' : 'text-text-2 hover:text-text'"
              @click="closeMenu"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <!-- Actions -->
          <div class="mt-auto flex flex-col gap-2.5 border-t-2 border-border px-4 py-5">
            <button
              type="button"
              class="jz-frame-sm jz-press-sm flex items-center justify-between rounded-[10px] bg-surface-2 px-4 py-3 text-[15px] font-semibold text-text"
              @click="toggle"
            >
              <span>Theme</span>
              <ClientOnly>
                <span class="text-[18px]">{{ isDark ? "☀️" : "🌙" }}</span>
                <template #fallback>
                  <span class="text-[18px]">🌙</span>
                </template>
              </ClientOnly>
            </button>

            <ClientOnly>
              <button
                v-if="isAuthenticated"
                type="button"
                class="jz-frame-sm jz-press-sm flex items-center justify-between rounded-[10px] bg-surface-2 px-4 py-3 text-[15px] font-semibold text-text disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="signingOut"
                @click="handleSignOut"
              >
                <span>Sign out</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-text-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
              </button>
            </ClientOnly>

            <ClientOnly>
              <NuxtLink
                :to="ctaTarget"
                class="jz-frame jz-press rounded-[10px] bg-accent px-4 py-3 text-center text-[15px] font-semibold text-white"
                @click="track('cta_clicked', { location: 'mobile_menu', label: ctaLabel, target: ctaTarget }); closeMenu()"
              >
                {{ ctaLabel }}
              </NuxtLink>
              <template #fallback>
                <span
                  class="inline-block h-[46px] w-full animate-pulse rounded-[10px] bg-accent/40"
                  aria-hidden="true"
                />
              </template>
            </ClientOnly>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
/* Smooth slide-in drawer + backdrop fade */
.jz-drawer-enter-active,
.jz-drawer-leave-active {
  transition: transform 0.34s cubic-bezier(0.32, 0.72, 0, 1);
}
.jz-drawer-enter-from,
.jz-drawer-leave-to {
  transform: translateX(100%);
}

.jz-backdrop-enter-active,
.jz-backdrop-leave-active {
  transition: opacity 0.34s ease;
}
.jz-backdrop-enter-from,
.jz-backdrop-leave-to {
  opacity: 0;
}
</style>
