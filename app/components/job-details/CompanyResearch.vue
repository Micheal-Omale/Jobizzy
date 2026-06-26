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
  <div
    class="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <div :class="['flex items-center justify-between gap-4', dossier ? 'mb-6' : '']">
      <div class="flex items-center gap-2">
        <svg
          class="h-4 w-4 text-text-secondary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
          <path d="M10 6h4" />
          <path d="M10 10h4" />
          <path d="M10 14h4" />
          <path d="M10 18h4" />
        </svg>
        <h2 class="text-[16px] font-semibold leading-6 text-text-primary">Company Research</h2>
      </div>

      <button
        v-if="!dossier"
        type="button"
        @click="runResearch"
        :disabled="loading"
        class="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-foreground hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          v-if="loading"
          class="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <svg
          v-else
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        {{ loading ? "Researching..." : "Research Company" }}
      </button>
    </div>

    <div v-if="errorMsg" class="mt-4 rounded-md bg-red-50 p-3 text-[13px] text-red-600">
      {{ errorMsg }}
    </div>

    <!-- Empty state -->
    <div v-if="!dossier" class="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <svg
        class="h-8 w-8 text-text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </svg>
      <p class="text-[14px] font-medium text-text-secondary">No research yet</p>
      <p class="max-w-sm text-[13px] leading-5 text-text-muted">
        Click "Research Company" to let the AI browse {{ company }}'s public pages and build a
        dossier.
      </p>
    </div>

    <!-- Filled state -->
    <div v-else class="flex flex-col gap-6">
      <!-- 1. Company Overview -->
      <div v-if="dossier.companyOverview">
        <h3 class="mb-2 text-[14px] font-semibold text-text-primary">Company Overview</h3>
        <p class="text-[14px] leading-relaxed text-text-secondary">{{ dossier.companyOverview }}</p>
      </div>

      <!-- 2. Tech Stack -->
      <div v-if="dossier.techStack?.length">
        <h3 class="mb-2 text-[14px] font-semibold text-text-primary">Tech Stack</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tech in dossier.techStack"
            :key="tech"
            class="inline-flex items-center rounded-md bg-surface-secondary px-2.5 py-1 text-[13px] font-medium text-text-secondary"
          >
            {{ tech }}
          </span>
        </div>
      </div>

      <!-- 3. Culture -->
      <div v-if="dossier.culture?.length">
        <h3 class="mb-2 text-[14px] font-semibold text-text-primary">Culture & Values</h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="c in dossier.culture" :key="c" class="text-[14px] text-text-secondary">
            {{ c }}
          </li>
        </ul>
      </div>

      <!-- 4. Why This Role -->
      <div v-if="dossier.whyThisRole">
        <h3 class="mb-2 text-[14px] font-semibold text-text-primary">Why This Role</h3>
        <p class="text-[14px] leading-relaxed text-text-secondary">{{ dossier.whyThisRole }}</p>
      </div>

      <!-- 5. Your Edge (highlighted) -->
      <div v-if="dossier.yourEdge?.length" class="rounded-xl border border-accent/10 bg-accent/5 p-4">
        <h3 class="mb-2 flex items-center gap-2 text-[14px] font-semibold text-accent">
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          Your Edge
        </h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="edge in dossier.yourEdge" :key="edge" class="text-[14px] text-text-secondary">
            {{ edge }}
          </li>
        </ul>
      </div>

      <!-- 6. Gaps to Address -->
      <div v-if="dossier.gapsToAddress?.length">
        <h3 class="mb-2 text-[14px] font-semibold text-text-primary">Gaps to Address</h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="gap in dossier.gapsToAddress" :key="gap" class="text-[14px] text-text-secondary">
            {{ gap }}
          </li>
        </ul>
      </div>

      <!-- 7. Smart Questions -->
      <div v-if="dossier.smartQuestions?.length">
        <h3 class="mb-2 text-[14px] font-semibold text-text-primary">Smart Questions</h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="q in dossier.smartQuestions" :key="q" class="text-[14px] italic text-text-secondary">
            "{{ q }}"
          </li>
        </ul>
      </div>

      <!-- 8. Interview Prep -->
      <div v-if="dossier.interviewPrep?.length">
        <h3 class="mb-2 text-[14px] font-semibold text-text-primary">Interview Prep</h3>
        <ul class="list-disc space-y-1 pl-5">
          <li v-for="prep in dossier.interviewPrep" :key="prep" class="text-[14px] text-text-secondary">
            {{ prep }}
          </li>
        </ul>
      </div>

      <!-- 9. Sources -->
      <div v-if="dossier.sources?.length" class="mt-4 border-t border-border pt-4">
        <p class="mb-2 text-[12px] font-medium text-text-muted">Sources:</p>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="src in dossier.sources"
            :key="src"
            :href="src"
            target="_blank"
            class="break-all text-[12px] text-accent hover:underline"
          >
            {{ src }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
