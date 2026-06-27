<script setup lang="ts">
const { isAuthenticated } = useAuth();
const { track } = useAnalytics();

const ctaTarget = computed<string>(() => (isAuthenticated.value ? "/dashboard" : "/login"));
</script>

<template>
  <section class="relative overflow-hidden border-t-2 border-border bg-accent">
    <div class="jz-dot-grid-light absolute inset-0" aria-hidden="true" />
    <div class="relative mx-auto max-w-[780px] px-7 py-[84px] text-center">
      <h2 class="m-0 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-[46px]">
        Your next job search can feel a lot less overwhelming
      </h2>
      <p class="mx-auto mt-[18px] max-w-[480px] text-[17px] leading-[1.5]" style="color:#ede7ff">
        Set up your profile, upload your resume, and start finding matches in minutes.
      </p>

      <div class="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
        <NuxtLink
          :to="ctaTarget"
          class="jz-frame jz-press rounded-[11px] bg-white px-7 py-[15px] text-[16px] font-bold text-accent-ink"
          @click="track('cta_clicked', { location: 'bottom_cta', label: 'Get Started', target: ctaTarget })"
        >
          Get Started &rarr;
        </NuxtLink>
        <NuxtLink
          :to="ctaTarget"
          class="rounded-[11px] border-2 border-white bg-transparent px-7 py-[15px] text-[16px] font-bold text-white transition-colors hover:bg-white/[0.12]"
          @click="track('cta_clicked', { location: 'bottom_cta', label: 'Find Your First Match', target: ctaTarget })"
        >
          Find Your First Match
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
