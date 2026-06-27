<script setup lang="ts">
import { computed, ref } from "vue";
import type { ExtractedProfile, Profile } from "~~/types";

type Props = {
  // The URL of the resume already saved to the profile, if any.
  resumeUrl?: string | null;
  // The last-saved profile — the source for "Generate Resume from Profile".
  profile?: Profile | null;
};

const props = defineProps<Props>();
const emit = defineEmits<{
  extracted: [ExtractedProfile];
  generated: [string];
}>();

// Two-way bound to the page so the staged file reaches ProfileForm's save and
// can be cleared after a successful save. Upload + extraction land in 06/07.
const file = defineModel<File | null>("file", { default: null });

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const errorMessage = ref("");

function validate(candidate: File): string {
  if (candidate.type !== "application/pdf") return "Please choose a PDF file.";
  if (candidate.size > MAX_RESUME_BYTES) return "That file is over 5MB.";
  return "";
}

function accept(candidate: File | undefined | null): void {
  if (!candidate) return;
  const error = validate(candidate);
  if (error) {
    errorMessage.value = error;
    file.value = null;
    return;
  }
  errorMessage.value = "";
  file.value = candidate;
}

function openPicker(): void {
  fileInput.value?.click();
}

function onInputChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  accept(input.files?.[0]);
  input.value = "";
}

function onDrop(event: DragEvent): void {
  isDragging.value = false;
  accept(event.dataTransfer?.files?.[0]);
}

function clearFile(): void {
  file.value = null;
  errorMessage.value = "";
}

// The bucket is private, so the stored URL won't open directly — download the
// object via the SDK and open the resulting blob URL in a new tab.
const { getResumeObjectUrl, extractFromResume, generateResume } = useProfile();
const viewing = ref(false);
const generating = ref(false);

// Extraction works off the staged file or, on a return visit, the résumé on
// file. The extracted fields go up to the page, which re-seeds the form.
const extracting = ref(false);
const canExtract = computed<boolean>(() => !!file.value || !!props.resumeUrl);

async function extractResume(): Promise<void> {
  if (extracting.value) return;
  extracting.value = true;
  errorMessage.value = "";
  const result = await extractFromResume(file.value);
  extracting.value = false;
  if ("data" in result) {
    emit("extracted", result.data);
  } else {
    errorMessage.value = result.error;
  }
}

// Generates a fresh PDF from the saved profile, then opens it. The page is told
// the new résumé URL so its on-file row updates. The min-field gate lives in the
// composable; its message surfaces in the shared error line.
async function runGenerate(): Promise<void> {
  if (generating.value) return;
  generating.value = true;
  errorMessage.value = "";
  const result = await generateResume(props.profile ?? ({} as Profile));
  generating.value = false;
  if ("viewUrl" in result) {
    window.open(result.viewUrl, "_blank", "noopener");
    emit("generated", result.resumeUrl);
  } else {
    errorMessage.value = result.error;
  }
}

async function viewResume(): Promise<void> {
  if (viewing.value) return;
  viewing.value = true;
  errorMessage.value = "";
  const result = await getResumeObjectUrl();
  viewing.value = false;
  if ("url" in result) {
    window.open(result.url, "_blank", "noopener");
  } else {
    errorMessage.value = result.error;
  }
}
</script>

<template>
  <div class="jz-frame-lg rounded-[14px] bg-surface p-6">
    <h2 class="font-display text-[19px] font-bold text-text">Resume</h2>
    <p class="mt-1.5 mb-[18px] text-[14px] leading-5 text-text-2">
      Upload an existing resume to auto-fill the profile, or generate a new
      tailored one from your details below.
    </p>

    <input
      ref="fileInput"
      type="file"
      accept="application/pdf"
      class="hidden"
      @change="onInputChange"
    />

    <button
      type="button"
      class="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-[34px] text-center transition-colors"
      :class="
        isDragging
          ? 'border-accent bg-accent-soft'
          : 'border-border-soft bg-surface-sunk'
      "
      @click="openPicker"
      @dragover.prevent="isDragging = true"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <span class="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border bg-accent-soft text-accent-ink">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M5 20h14" />
        </svg>
      </span>
      <span class="font-display text-[16px] font-bold text-text">
        Click to upload or drag and drop
      </span>
      <span class="font-mono text-[12px] text-text-3">PDF only · Max 5MB</span>
      <span class="jz-frame-sm mt-1 rounded-[9px] bg-surface px-[18px] py-2.5 text-[13.5px] font-semibold text-text">
        Select Resume
      </span>
    </button>

    <p v-if="errorMessage" role="alert" class="mt-2 text-[13px] font-semibold leading-5 text-error">
      {{ errorMessage }}
    </p>

    <div
      v-if="file"
      class="mt-3 flex items-center justify-between gap-3 rounded-[9px] border-2 border-border bg-surface-2 px-3.5 py-2.5"
    >
      <span class="truncate text-[13px] font-medium text-text">{{ file.name }}</span>
      <button
        type="button"
        class="shrink-0 text-[12px] font-semibold text-text-2 transition-colors hover:text-error"
        @click="clearFile"
      >
        Remove
      </button>
    </div>
    <div
      v-else-if="resumeUrl"
      class="mt-3 flex items-center justify-between gap-3"
    >
      <p class="flex items-center gap-2 text-[13px] text-text-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-good" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        A résumé is on file. Selecting a new one replaces it.
      </p>
      <button
        type="button"
        :disabled="viewing"
        class="shrink-0 text-[13px] font-semibold text-accent-ink transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        @click="viewResume"
      >
        {{ viewing ? "Opening…" : "View résumé" }}
      </button>
    </div>

    <button
      v-if="canExtract"
      type="button"
      :disabled="extracting"
      class="jz-frame jz-press mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[9px] bg-surface-2 px-4 py-2.5 text-[14px] font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
      @click="extractResume"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </svg>
      {{ extracting ? "Extracting…" : "Extract from Resume" }}
    </button>

    <div class="mt-[18px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-[14px] text-text-2">
        Need a fresh document based on the fields below?
      </p>
      <button
        type="button"
        :disabled="generating"
        class="jz-frame jz-press inline-flex shrink-0 items-center justify-center gap-2 rounded-[9px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        @click="runGenerate"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
        {{ generating ? "Generating…" : "Generate Resume from Profile" }}
      </button>
    </div>
  </div>
</template>
