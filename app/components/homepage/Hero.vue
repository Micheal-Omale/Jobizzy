<script setup lang="ts">
const { isAuthenticated } = useAuth();
const { track } = useAnalytics();

const ctaTarget = computed<string>(() => (isAuthenticated.value ? "/dashboard" : "/login"));
</script>

<template>
  <!-- Hero -->
  <section class="relative overflow-hidden border-b-2 border-border">
    <div class="jz-dot-grid absolute inset-0 opacity-80" aria-hidden="true" />
    <div class="relative mx-auto max-w-[1000px] px-7 pt-20 pb-[92px] text-center md:pt-[84px]">
      <div
        class="jz-frame-sm mb-[26px] inline-flex items-center gap-2 rounded-[22px] bg-good-soft px-3.5 py-[7px] text-[12.5px] font-semibold text-good-ink"
      >
        <span class="h-2 w-2 rounded-full border-[1.5px] border-border bg-good" />
        Your AI job copilot
      </div>

      <h1
        class="m-0 font-display text-[40px] font-bold leading-[1.0] tracking-[-0.04em] text-text sm:text-[52px] md:text-[62px]"
      >
        Job hunting is hard.<br />
        Your tools <span class="text-accent">shouldn&rsquo;t</span> be.
      </h1>

      <p class="mx-auto mt-[22px] max-w-[560px] text-[18px] leading-[1.55] text-text-2">
        Stop applying blind. Jobizzy finds the jobs, scores every role against your
        real skills, and researches the company before you apply.
      </p>

      <div class="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
        <NuxtLink
          :to="ctaTarget"
          class="jz-frame jz-press rounded-[11px] bg-accent px-[26px] py-[15px] text-[16px] font-semibold text-white"
          @click="track('cta_clicked', { location: 'hero', label: 'Get Started', target: ctaTarget })"
        >
          Get Started &rarr;
        </NuxtLink>
        <NuxtLink
          :to="ctaTarget"
          class="jz-frame jz-press rounded-[11px] bg-surface-2 px-[26px] py-[15px] text-[16px] font-semibold text-text"
          @click="track('cta_clicked', { location: 'hero', label: 'Find Your First Match', target: ctaTarget })"
        >
          Find Your First Match
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- Product preview -->
  <section class="border-b-2 border-border bg-surface-sunk px-7 py-14">
    <div class="mx-auto max-w-[1080px]">
      <div class="jz-frame-lg overflow-hidden rounded-[14px] bg-surface">
        <!-- Browser chrome -->
        <div class="flex items-center gap-[7px] border-b-2 border-border bg-surface-2 px-4 py-[11px]">
          <span class="h-[11px] w-[11px] rounded-full border-[1.5px] border-border" style="background:#ff5f57" />
          <span class="h-[11px] w-[11px] rounded-full border-[1.5px] border-border" style="background:#febc2e" />
          <span class="h-[11px] w-[11px] rounded-full border-[1.5px] border-border" style="background:#28c840" />
          <span
            class="mx-auto rounded-[6px] border-[1.5px] border-border-soft bg-surface-sunk px-3.5 py-1 font-mono text-[12px] text-text-3"
          >
            jobizzy.ai/dashboard
          </span>
        </div>

        <!-- Body -->
        <div class="grid grid-cols-2 gap-3.5 p-[22px] md:grid-cols-4">
          <!-- Stat cards -->
          <div class="jz-frame-sm rounded-[10px] bg-surface-2 px-[15px] py-3.5">
            <div class="font-mono text-[10.5px] uppercase tracking-[0.04em] text-text-3">Total Jobs</div>
            <div class="mt-[3px] font-display text-[26px] font-bold text-text">284</div>
            <div class="mt-0.5 text-[11px] font-semibold text-good-ink">+12% &#9650;</div>
          </div>
          <div class="jz-frame-sm rounded-[10px] bg-surface-2 px-[15px] py-3.5">
            <div class="font-mono text-[10.5px] uppercase tracking-[0.04em] text-text-3">Avg Match</div>
            <div class="mt-[3px] font-display text-[26px] font-bold text-text">82%</div>
            <div class="mt-0.5 text-[11px] font-semibold text-good-ink">+3% &#9650;</div>
          </div>
          <div class="jz-frame-sm rounded-[10px] bg-surface-2 px-[15px] py-3.5">
            <div class="font-mono text-[10.5px] uppercase tracking-[0.04em] text-text-3">Researched</div>
            <div class="mt-[3px] font-display text-[26px] font-bold text-text">35</div>
            <div class="mt-0.5 text-[11px] font-semibold text-text-3">companies</div>
          </div>
          <div class="jz-frame-sm rounded-[10px] bg-accent px-[15px] py-3.5">
            <div class="font-mono text-[10.5px] uppercase tracking-[0.04em] text-white/85">This Week</div>
            <div class="mt-[3px] font-display text-[26px] font-bold text-white">28</div>
            <div class="mt-0.5 text-[11px] font-semibold text-white/85">new roles</div>
          </div>

          <!-- Recent activity -->
          <div class="jz-frame-sm col-span-2 rounded-[10px] bg-surface-2 p-4">
            <div class="mb-3 text-[14px] font-bold text-text">Recent Activity</div>
            <div class="flex flex-col gap-[11px]">
              <div class="flex items-center gap-2.5">
                <span class="h-[9px] w-[9px] rounded-full border-[1.5px] border-border bg-accent" />
                <span class="text-[12.5px] text-text-2">Found 8 jobs for Frontend Engineer</span>
              </div>
              <div class="flex items-center gap-2.5">
                <span class="h-[9px] w-[9px] rounded-full border-[1.5px] border-border bg-info" />
                <span class="text-[12.5px] text-text-2">Researched Stripe</span>
              </div>
              <div class="flex items-center gap-2.5">
                <span class="h-[9px] w-[9px] rounded-full border-[1.5px] border-border bg-good" />
                <span class="text-[12.5px] text-text-2">Found 12 jobs for React Developer</span>
              </div>
            </div>
          </div>

          <!-- Company research bars -->
          <div class="jz-frame-sm col-span-2 rounded-[10px] bg-surface-2 p-4">
            <div class="mb-3.5 text-[14px] font-bold text-text">Company Research</div>
            <div class="flex h-[84px] items-end gap-[9px]">
              <div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="height:24%" />
              <div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="height:46%" />
              <div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="height:34%" />
              <div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="height:70%" />
              <div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-accent" style="height:100%" />
              <div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="height:52%" />
              <div class="flex-1 rounded-t-[4px] border-[1.5px] border-border bg-info" style="height:18%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
