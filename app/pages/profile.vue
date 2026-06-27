<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { ExtractedProfile, Profile } from "~~/types";
import { computeProfileCompletion } from "~~/lib/profile";

definePageMeta({
  layout: "default",
});

const { user } = useAuth();
const { fetchProfile } = useProfile();
const { track } = useAnalytics();

// `profile` is the last-saved state — it drives the completion banner.
// `formSeed` is what the form is seeded with; extraction replaces it (without
// touching the saved state) and `formKey` remounts the form to apply it.
const profile = ref<Profile | null>(null);
const formSeed = ref<Profile | null>(null);
const formKey = ref(0);
const extractNotice = ref("");
const resumeFile = ref<File | null>(null);
const loading = ref(true);
const loadError = ref("");

const userEmail = computed<string | null>(() => user.value?.email ?? null);

// The banner reflects the last-saved profile. It updates after each save and is
// hidden once the profile is complete.
const completion = computed(() =>
  profile.value
    ? computeProfileCompletion(profile.value)
    : { percentage: 0, missingFields: [], isComplete: false },
);

// The session is client-only (access token in memory), so the profile is fetched
// on the client after auth has resolved.
onMounted(async () => {
  const result = await fetchProfile();
  if (result.success && result.data) {
    profile.value = result.data;
    formSeed.value = result.data;
  } else {
    loadError.value = result.error ?? "Could not load your profile.";
  }
  loading.value = false;
});

function handleSaved(updated: Profile): void {
  const wasComplete = profile.value?.is_complete ?? false;
  profile.value = updated;
  formSeed.value = updated;
  resumeFile.value = null;
  extractNotice.value = "";
  if (updated.is_complete && !wasComplete && user.value) {
    track("profile_completed", { userId: user.value.id });
  }
}

// Generation stores the new PDF at the same key as an uploaded résumé, so the
// on-file row just needs the fresh URL. Both the saved state and the form seed
// carry it forward without touching any other field.
function handleGenerated(resumeUrl: string): void {
  if (profile.value) profile.value = { ...profile.value, resume_pdf_url: resumeUrl };
  if (formSeed.value) formSeed.value = { ...formSeed.value, resume_pdf_url: resumeUrl };
}

// Replace-all merge: extracted fields overlay the current seed, then the form
// remounts so the user reviews everything before saving. Fields the résumé
// didn't yield keep their current values.
function handleExtracted(extracted: ExtractedProfile): void {
  const base = formSeed.value ?? blankProfile();
  formSeed.value = { ...base, ...extracted } as Profile;
  formKey.value += 1;
  extractNotice.value =
    "Review the details pulled from your résumé below, then Save Profile.";
}

function blankProfile(): Profile {
  return {
    id: user.value?.id ?? "",
    full_name: null,
    email: userEmail.value,
    phone: null,
    location: null,
    current_title: null,
    experience_level: null,
    years_experience: null,
    skills: null,
    industries: null,
    work_experience: null,
    education: null,
    job_titles_seeking: null,
    remote_preference: null,
    preferred_locations: null,
    salary_expectation: null,
    cover_letter_tone: null,
    linkedin_url: null,
    portfolio_url: null,
    work_authorization: null,
    resume_pdf_url: null,
    is_complete: false,
    created_at: "",
    updated_at: "",
  };
}
</script>

<template>
  <div class="mx-auto max-w-[880px] px-7 pt-[34px] pb-16">
    <h1 class="mb-[22px] font-display text-[36px] font-bold tracking-[-0.03em] text-text">Your Profile</h1>
    <div class="flex flex-col gap-[18px]">
      <ClientOnly>
        <template v-if="loading">
          <div class="jz-frame h-40 animate-pulse rounded-[14px] bg-surface-sunk" />
          <div class="jz-frame h-[760px] animate-pulse rounded-[14px] bg-surface-sunk" />
        </template>
        <template v-else>
          <p
            v-if="loadError"
            role="alert"
            class="rounded-[9px] border-2 border-border bg-error-soft px-4 py-3 text-[13px] font-semibold leading-5 text-error"
          >
            {{ loadError }}
          </p>
          <ProfileCompletionIndicator
            v-if="profile && !completion.isComplete"
            :percentage="completion.percentage"
            :missing-fields="completion.missingFields"
          />
          <ProfileResumeUpload
            v-model:file="resumeFile"
            :resume-url="profile?.resume_pdf_url"
            :profile="profile"
            @extracted="handleExtracted"
            @generated="handleGenerated"
          />
          <p
            v-if="extractNotice"
            role="status"
            class="rounded-[9px] border-2 border-border bg-accent-soft px-4 py-3 text-[13px] font-semibold leading-5 text-accent-ink"
          >
            {{ extractNotice }}
          </p>
          <ProfileForm
            :key="formKey"
            :initial-profile="formSeed"
            :user-email="userEmail"
            :resume-file="resumeFile"
            @saved="handleSaved"
          />
        </template>

        <template #fallback>
          <div class="jz-frame h-40 animate-pulse rounded-[14px] bg-surface-sunk" />
          <div class="jz-frame h-[760px] animate-pulse rounded-[14px] bg-surface-sunk" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
