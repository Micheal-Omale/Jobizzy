<script setup lang="ts">
const jobRows = [
  { company: "Vercel", score: "94%", scoreColor: "bg-success", salary: "$160k - $200k", source: "LinkedIn", sourceClass: "bg-info-lightest text-linkedin" },
  { company: "Stripe", score: "88%", scoreColor: "bg-info-medium", salary: "$180k - $240k", source: "URL", sourceClass: "bg-surface-secondary text-text-secondary" },
  { company: "Linear", score: "96%", scoreColor: "bg-success", salary: "$150k - $190k", source: "LinkedIn", sourceClass: "bg-info-lightest text-linkedin" },
  { company: "Notion", score: "72%", scoreColor: "bg-warning", salary: "$130k - $170k", source: "LinkedIn", sourceClass: "bg-info-lightest text-linkedin" },
  { company: "OpenAI", score: "91%", scoreColor: "bg-success", salary: "$200k - $280k", source: "LinkedIn", sourceClass: "bg-info-lightest text-linkedin" },
  { company: "Figma", score: "85%", scoreColor: "bg-info-medium", salary: "$170k - $220k", source: "URL", sourceClass: "bg-surface-secondary text-text-secondary" },
];

const searchFeatures = [
  {
    title: "Find jobs that actually fit",
    description: "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
    active: true,
  },
  {
    title: "Know the Company Before You Apply",
    description: "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
    active: false,
  },
  {
    title: "Keep track of every application",
    description: "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
    active: false,
  },
];

const confidenceFeatures = [
  {
    title: "Understand your match score",
    description: "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
    active: false,
  },
  {
    title: "AI-Powered Job Matching",
    description: "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
    active: true,
  },
  {
    title: "Focus on the right roles",
    description: "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
    active: false,
  },
];
</script>

<template>
  <section class="border-t border-border bg-surface">
    <div class="jp-page-grid grid grid-cols-1 lg:grid-cols-2">
      <div class="border-b border-border px-8 py-16 md:px-16 md:py-24 lg:border-r">
        <h2 class="max-w-xl text-[42px] font-bold leading-[1.08] text-text-primary md:text-[54px]">
          Manage Your Job<br />
          Search With Ease
        </h2>

        <div class="mt-16 border-t border-border">
          <div
            v-for="feature in searchFeatures"
            :key="feature.title"
            class="border-b border-border py-8 pl-6 pr-3"
            :class="feature.active ? 'border-l-2 border-l-accent' : 'border-l-2 border-l-surface'"
          >
            <h3 class="text-[20px] font-semibold text-text-darker">
              {{ feature.title }}
            </h3>
            <p class="mt-5 max-w-2xl text-[20px] leading-8 text-text-secondary">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center border-b border-border bg-surface-muted px-8 py-16 md:px-16 md:py-24">
        <div class="w-full max-w-[620px] overflow-hidden rounded-2xl border border-border bg-surface shadow-md shadow-info-muted/10">
          <div class="grid grid-cols-[1.3fr_1fr_1.1fr_.8fr] border-b border-border bg-surface-secondary px-7 py-5 text-[13px] font-bold uppercase text-text-secondary">
            <span>Company</span>
            <span>Match Score</span>
            <span>Salary Est.</span>
            <span>Source</span>
          </div>

          <div
            v-for="job in jobRows"
            :key="job.company"
            class="grid grid-cols-[1.3fr_1fr_1.1fr_.8fr] items-center border-b border-border px-7 py-5 last:border-b-0"
          >
            <div class="flex items-center gap-4">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-secondary text-[18px] text-text-muted">
                &#9874;
              </span>
              <span class="text-[17px] font-semibold text-text-primary">{{ job.company }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="h-1.5 w-12 rounded-full bg-border-light">
                <span class="block h-1.5 w-10 rounded-full" :class="job.scoreColor"></span>
              </span>
              <span class="text-[16px] font-semibold text-text-secondary">{{ job.score }}</span>
            </div>
            <span class="text-[16px] font-medium text-text-secondary">{{ job.salary }}</span>
            <span class="justify-self-start rounded-md border border-border px-3 py-2 text-[15px] font-semibold" :class="job.sourceClass">
              {{ job.source }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="jp-hatch h-28 border-b border-border"></div>

    <div class="jp-page-grid grid grid-cols-1 lg:grid-cols-2">
      <div class="order-2 flex items-center justify-center border-b border-border bg-surface-muted px-8 py-16 md:px-16 md:py-24 lg:order-1 lg:border-r">
        <img
          src="/public/images/agnet-log.png"
          alt="JobPilot agent log"
          class="w-full max-w-[620px] rounded-[22px] shadow-lg shadow-info-muted/10"
        />
      </div>

      <div class="order-1 border-b border-border px-8 py-16 md:px-16 md:py-24 lg:order-2">
        <h2 class="max-w-2xl text-[42px] font-bold leading-[1.08] text-text-primary md:text-[54px]">
          Apply With More<br />
          Confidence, Every Time
        </h2>

        <div class="mt-16 border-t border-border">
          <div
            v-for="feature in confidenceFeatures"
            :key="feature.title"
            class="border-b border-border py-8 pl-6 pr-3"
            :class="feature.active ? 'border-l-2 border-l-success' : 'border-l-2 border-l-surface'"
          >
            <h3 class="text-[20px] font-semibold text-text-darker">
              {{ feature.title }}
            </h3>
            <p class="mt-5 max-w-2xl text-[20px] leading-8 text-text-secondary">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="jp-hatch h-28 border-b border-border"></div>
  </section>
</template>
