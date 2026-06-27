<script setup lang="ts">
type Tier = "good" | "info" | "fair";

interface JobRow {
  company: string;
  match: number;
  tier: Tier;
  salary: string;
  source: "IN" | "URL";
}

const rows: JobRow[] = [
  { company: "Vercel", match: 94, tier: "good", salary: "$160–200k", source: "IN" },
  { company: "Stripe", match: 88, tier: "info", salary: "$180–240k", source: "URL" },
  { company: "Linear", match: 96, tier: "good", salary: "$150–190k", source: "IN" },
  { company: "Notion", match: 72, tier: "fair", salary: "$130–170k", source: "IN" },
  { company: "OpenAI", match: 91, tier: "good", salary: "$200–280k", source: "IN" },
];

const barClass: Record<Tier, string> = {
  good: "bg-good",
  info: "bg-info",
  fair: "bg-fair",
};
const inkClass: Record<Tier, string> = {
  good: "text-good-ink",
  info: "text-info-ink",
  fair: "text-fair-ink",
};

const manageFeatures = [
  {
    title: "Find jobs that actually fit",
    body: "Search by title and location, or paste a job link. Get matched roles you can scan in seconds.",
  },
  {
    title: "Know the company before you apply",
    body: "Jobizzy browses a company's public pages and hands you a dossier — apply with confidence.",
  },
  {
    title: "Keep track of every application",
    body: "A clear view of every job you've found, tailored — activity and progress in one place.",
  },
];

const applyFeatures = [
  {
    title: "Understand your match score",
    body: "See how your profile lines up with each role before you apply — what fits and what's missing.",
  },
  {
    title: "AI-powered job matching",
    body: "Jobizzy scores every role against your actual skills, so you focus only on the ones that matter.",
  },
  {
    title: "Focus on the right roles",
    body: "Filter out low-fit jobs. Spend less time sorting and more time applying.",
  },
];
</script>

<template>
  <!-- Feature 1 — Manage with ease -->
  <section
    class="mx-auto grid max-w-[1140px] items-center gap-12 px-7 py-[84px] md:grid-cols-[1fr_1.15fr] md:gap-16"
  >
    <div>
      <div class="mb-4 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent-ink">
        01 — Find &amp; Track
      </div>
      <h2 class="m-0 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-text md:text-[42px]">
        Manage your job search with ease
      </h2>
      <div class="mt-[30px] flex flex-col">
        <div
          v-for="(feat, i) in manageFeatures"
          :key="feat.title"
          class="border-t-2 border-border-soft py-[18px]"
          :class="{ 'border-b-2': i === manageFeatures.length - 1 }"
        >
          <div class="text-[16px] font-bold text-text">{{ feat.title }}</div>
          <div class="mt-[5px] text-[14.5px] leading-[1.5] text-text-2">{{ feat.body }}</div>
        </div>
      </div>
    </div>

    <!-- Jobs table -->
    <div class="jz-frame-lg overflow-hidden rounded-[14px] bg-surface-2">
      <div
        class="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr] border-b-2 border-border bg-surface-sunk px-[18px] py-[13px] font-mono text-[10.5px] font-bold uppercase tracking-[0.05em] text-text-3"
      >
        <span>Company</span><span>Match</span><span>Salary</span><span>Source</span>
      </div>
      <div
        v-for="(row, i) in rows"
        :key="row.company"
        class="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr] items-center px-[18px] py-3.5"
        :class="{ 'border-b-[1.5px] border-border-soft': i !== rows.length - 1 }"
      >
        <span class="text-[13.5px] font-semibold text-text">{{ row.company }}</span>
        <span class="flex items-center gap-2">
          <span class="h-[9px] w-[46px] overflow-hidden rounded-[5px] border-[1.5px] border-border bg-surface">
            <span class="block h-full" :class="barClass[row.tier]" :style="{ width: `${row.match}%` }" />
          </span>
          <b class="text-[13px]" :class="inkClass[row.tier]">{{ row.match }}%</b>
        </span>
        <span class="text-[12.5px] text-text-2">{{ row.salary }}</span>
        <span
          class="rounded-[5px] border-[1.5px] border-border px-[7px] py-[3px] text-center font-mono text-[10px] font-bold"
          :class="row.source === 'IN' ? 'bg-info-soft text-linkedin' : 'bg-surface-sunk text-text-2'"
        >
          {{ row.source }}
        </span>
      </div>
    </div>
  </section>

  <!-- Feature 2 — Apply with confidence -->
  <section class="border-y-2 border-border bg-surface-sunk">
    <div
      class="mx-auto grid max-w-[1140px] items-center gap-12 px-7 py-[84px] md:grid-cols-[1.15fr_1fr] md:gap-16"
    >
      <!-- Agent log terminal (intentionally dark in both themes) -->
      <div class="jz-frame-lg overflow-hidden rounded-[14px]" style="background:#161410">
        <div class="flex items-center gap-2 border-b-2 px-4 py-3" style="border-color:#000;background:#0e0d0a">
          <span class="h-[11px] w-[11px] rounded-full" style="background:#ff5f57" />
          <span class="h-[11px] w-[11px] rounded-full" style="background:#febc2e" />
          <span class="h-[11px] w-[11px] rounded-full" style="background:#28c840" />
          <span class="ml-2 font-mono text-[12px]" style="color:#8a857c">agent_log.ts</span>
        </div>
        <div class="px-5 py-[22px] font-mono text-[13px] leading-[2.05]" style="color:#e8e4da">
          <div><span style="color:#8a857c">1</span>&nbsp;&nbsp;<span style="color:#8b6dff">[SYSTEM]</span> Initializing Jobizzy Agent…</div>
          <div><span style="color:#8a857c">2</span>&nbsp;&nbsp;<span style="color:#c77dff">[SCAN]</span> Found 14 matching roles</div>
          <div><span style="color:#8a857c">3</span>&nbsp;&nbsp;&#8627; Filtered out 3 roles (below salary cap)</div>
          <div><span style="color:#8a857c">4</span>&nbsp;&nbsp;<span style="color:#4ade80">[ACTION]</span> Tailoring resume for Stripe</div>
          <div><span style="color:#8a857c">5</span>&nbsp;&nbsp;<span style="color:#fbbf24">…</span> Generating cover letter</div>
        </div>
      </div>

      <div>
        <div class="mb-4 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent-ink">
          02 — Apply Smart
        </div>
        <h2 class="m-0 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-text md:text-[42px]">
          Apply with more confidence, every time
        </h2>
        <div class="mt-[30px] flex flex-col">
          <div
            v-for="(feat, i) in applyFeatures"
            :key="feat.title"
            class="border-t-2 border-border-soft py-[18px]"
            :class="{ 'border-b-2': i === applyFeatures.length - 1 }"
          >
            <div class="text-[16px] font-bold text-text">{{ feat.title }}</div>
            <div class="mt-[5px] text-[14.5px] leading-[1.5] text-text-2">{{ feat.body }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
