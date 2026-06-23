<script setup lang="ts">
const { isAuthenticated } = useAuth();
const { track } = useAnalytics();

const ctaTarget = computed<string>(() => (isAuthenticated.value ? "/dashboard" : "/login"));
</script>

<template>
  <section class="w-full px-6 py-16 md:px-8 md:py-20">
    <div class="mx-auto overflow-hidden border border-border bg-surface">
      <div class="jp-soft-gradient flex min-h-[460px] flex-col items-center justify-center px-6 py-20 text-center md:min-h-[500px] md:px-10">
        <h1 class="max-w-4xl text-[42px] font-bold leading-[1.08] text-text-primary md:text-[64px] lg:text-[72px]">
          Job hunting is hard.<br />
          Your tools shouldn&rsquo;t be.
        </h1>

        <p class="mt-7 max-w-3xl text-[18px] leading-8 text-text-secondary md:text-[20px]">
          Stop applying blind. JobPilot finds the jobs, researches the companies, and
          gives you everything you need to stand out.
        </p>

        <div class="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <NuxtLink
            :to="ctaTarget"
            class="inline-flex items-center gap-3 rounded-md bg-text-slate px-7 py-4 text-[18px] font-medium text-surface transition-colors hover:bg-overlay"
            @click="track('cta_clicked', { location: 'hero', label: 'Get Started', target: ctaTarget })"
          >
            Get Started
            <span class="text-text-muted">&blacktriangleright;</span>
          </NuxtLink>
          <NuxtLink
            :to="ctaTarget"
            class="rounded-md border border-border bg-surface/80 px-7 py-4 text-[18px] font-medium text-text-primary transition-colors hover:bg-surface"
            @click="track('cta_clicked', { location: 'hero', label: 'Find Your First Match', target: ctaTarget })"
          >
            Find Your First Match
          </NuxtLink>
        </div>
      </div>

      <div class="overflow-hidden border-t border-border bg-surface-tertiary px-6 pt-16 md:px-20 md:pt-20">
        <img
          src="/public/images/dashboard-demo.png"
          alt="JobPilot dashboard preview"
          class="mx-auto w-full max-w-[1160px]"
        />
      </div>
    </div>
  </section>
</template>
