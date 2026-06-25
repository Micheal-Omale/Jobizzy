<script setup lang="ts">
import { computed } from "vue";

type Props = {
  companyName: string | null;
};

const props = defineProps<Props>();

const company = computed<string>(() => props.companyName ?? "this company");
</script>

<template>
  <div
    class="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
  >
    <div class="flex items-center justify-between gap-4">
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

      <!-- Inert in feature 12 (UI only). The research agent is wired in feature 13. -->
      <button
        type="button"
        class="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-foreground hover:bg-accent-dark"
      >
        <svg
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
        Research Company
      </button>
    </div>

    <div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
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
  </div>
</template>
