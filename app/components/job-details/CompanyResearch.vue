<script setup lang="ts">
import { ref, computed } from "vue";
import type { Job, CompanyResearch } from "~~/types";

const props = defineProps<{
  job: Job;
}>();

const emit = defineEmits<{
  (e: "update:companyResearch", dossier: CompanyResearch): void;
}>();

const company = computed<string>(() => props.job.company ?? "this company");
const dossier = computed(() => props.job.company_research);

const loading = ref(false);
const errorMsg = ref<string | null>(null);

async function runResearch() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const response = await $fetch<{ success: boolean; dossier: CompanyResearch }>(
      "/api/agent/research",
      {
        method: "POST",
        body: { jobId: props.job.id },
      }
    );
    if (response.success && response.dossier) {
      emit("update:companyResearch", response.dossier);
      // Mutate locally for immediate reactivity
      props.job.company_research = response.dossier;
    }
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || "Research failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="jz-frame rounded-[14px] bg-surface p-6">
    <div class="mb-[18px] flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <span class="flex h-[30px] w-[30px] items-center justify-center rounded-lg border-2 border-border bg-accent-soft text-accent-ink">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 21h18M5 21V7l7-4 7 4v14" />
          </svg>
        </span>
        <h2 class="font-display text-[18px] font-bold text-text">Company Research</h2>
      </div>

      <button
        v-if="!dossier"
        type="button"
        :disabled="loading"
        class="jz-frame jz-press inline-flex shrink-0 items-center gap-2 rounded-[9px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        @click="runResearch"
      >
        <svg v-if="loading" class="h-[15px] w-[15px] animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        {{ loading ? "Researching…" : "Research Company" }}
      </button>
    </div>

    <div
      v-if="errorMsg"
      role="alert"
      class="mb-4 rounded-[9px] border-2 border-border bg-error-soft px-4 py-3 text-[13px] font-semibold text-error"
    >
      {{ errorMsg }}
    </div>

    <!-- Empty state -->
    <div
      v-if="!dossier"
      class="rounded-xl border-2 border-dashed border-border-soft bg-surface-sunk px-6 py-[42px] text-center"
    >
      <div class="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[13px] border-2 border-border bg-surface text-text-3">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        </svg>
      </div>
      <p class="font-display text-[17px] font-bold text-text">No research yet</p>
      <p class="mx-auto mt-1.5 max-w-[340px] text-[14px] leading-[1.5] text-text-2">
        Click "Research Company" to let the AI browse {{ company }}'s public pages and build a
        dossier.
      </p>
    </div>

    <!-- Filled state -->
    <div v-else class="flex flex-col gap-6">
      <!-- 1. Company Overview -->
      <div v-if="dossier.companyOverview">
        <h3 class="mb-2 text-[14px] font-bold text-text">Company Overview</h3>
        <p class="text-[14px] leading-relaxed text-text-2">{{ dossier.companyOverview }}</p>
      </div>

      <!-- 2. Tech Stack -->
      <div v-if="dossier.techStack?.length">
        <h3 class="mb-2 text-[14px] font-bold text-text">Tech Stack</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tech in dossier.techStack"
            :key="tech"
            class="rounded-md border-2 border-border bg-surface-2 px-2.5 py-1 text-[13px] font-medium text-text-2"
          >
            {{ tech }}
          </span>
        </div>
      </div>

      <!-- 3. Culture -->
      <div v-if="dossier.culture?.length">
        <h3 class="mb-2 text-[14px] font-bold text-text">Culture &amp; Values</h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="c in dossier.culture" :key="c" class="text-[14px] text-text-2">
            {{ c }}
          </li>
        </ul>
      </div>

      <!-- 4. Why This Role -->
      <div v-if="dossier.whyThisRole">
        <h3 class="mb-2 text-[14px] font-bold text-text">Why This Role</h3>
        <p class="text-[14px] leading-relaxed text-text-2">{{ dossier.whyThisRole }}</p>
      </div>

      <!-- 5. Your Edge (highlighted) -->
      <div v-if="dossier.yourEdge?.length" class="rounded-xl border-2 border-border bg-accent-soft p-4">
        <h3 class="mb-2 flex items-center gap-2 text-[14px] font-bold text-accent-ink">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          Your Edge
        </h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="edge in dossier.yourEdge" :key="edge" class="text-[14px] text-text-2">
            {{ edge }}
          </li>
        </ul>
      </div>

      <!-- 6. Gaps to Address -->
      <div v-if="dossier.gapsToAddress?.length">
        <h3 class="mb-2 text-[14px] font-bold text-text">Gaps to Address</h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="gap in dossier.gapsToAddress" :key="gap" class="text-[14px] text-text-2">
            {{ gap }}
          </li>
        </ul>
      </div>

      <!-- 7. Smart Questions -->
      <div v-if="dossier.smartQuestions?.length">
        <h3 class="mb-2 text-[14px] font-bold text-text">Smart Questions</h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="q in dossier.smartQuestions" :key="q" class="text-[14px] italic text-text-2">
            "{{ q }}"
          </li>
        </ul>
      </div>

      <!-- 8. Interview Prep -->
      <div v-if="dossier.interviewPrep?.length">
        <h3 class="mb-2 text-[14px] font-bold text-text">Interview Prep</h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="prep in dossier.interviewPrep" :key="prep" class="text-[14px] text-text-2">
            {{ prep }}
          </li>
        </ul>
      </div>

      <!-- 9. Sources -->
      <div v-if="dossier.sources?.length" class="mt-4 border-t-2 border-border-soft pt-4">
        <p class="mb-2 font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-text-3">Sources</p>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="src in dossier.sources"
            :key="src"
            :href="src"
            target="_blank"
            rel="noopener noreferrer"
            class="break-all font-mono text-[12px] text-accent-ink hover:underline"
          >
            {{ src }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
