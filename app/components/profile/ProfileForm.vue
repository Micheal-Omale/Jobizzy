<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  Education,
  ExperienceLevel,
  Profile,
  ProfileUpdate,
  RemotePreference,
  WorkAuthorization,
} from "~~/types";
import {
  DEGREE_OPTIONS,
  EXPERIENCE_LEVELS,
  REMOTE_PREFERENCES,
  WORK_AUTHORIZATIONS,
} from "~~/lib/profile";

type Props = {
  initialProfile: Profile | null;
  userEmail: string | null;
  resumeFile: File | null;
};

const props = defineProps<Props>();
const emit = defineEmits<{ saved: [Profile] }>();

type WorkRole = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
};

const MAX_ROLES = 3;

function emptyRole(): WorkRole {
  return {
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    responsibilities: "",
  };
}

// Coerce stored dates to what <input type="month"> accepts (YYYY-MM): a bare
// year becomes YYYY-01, anything else blank. Guards against year-only values
// saved before the server-side extractor normalized them.
function toMonth(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return value;
  const year = value.match(/^(\d{4})$/);
  return year ? `${year[1]}-01` : "";
}

function seedRoles(profile: Profile | null): WorkRole[] {
  const roles = profile?.work_experience;
  if (roles && roles.length > 0) {
    return roles.map((role) => ({
      company: role.company,
      title: role.title,
      startDate: toMonth(role.start_date),
      endDate: toMonth(role.end_date),
      currentlyWorking: role.currently_working,
      responsibilities: role.responsibilities,
    }));
  }
  return [emptyRole()];
}

const p = props.initialProfile;

const fullName = ref(p?.full_name ?? "");
const phone = ref(p?.phone ?? "");
const location = ref(p?.location ?? "");
const linkedinUrl = ref(p?.linkedin_url ?? "");
const portfolioUrl = ref(p?.portfolio_url ?? "");
const workAuthorization = ref<WorkAuthorization | "">(p?.work_authorization ?? "");

const currentTitle = ref(p?.current_title ?? "");
const experienceLevel = ref<ExperienceLevel | "">(p?.experience_level ?? "");
// v-model on <input type="number"> coerces this to a number once a value is
// entered (it stays "" while empty), so at runtime it is genuinely string | number.
const yearsExperience = ref<string | number>(p?.years_experience ?? "");
const skills = ref<string[]>(p?.skills ? [...p.skills] : []);
const skillInput = ref("");
const industries = ref<string[]>(p?.industries ? [...p.industries] : []);
const industryInput = ref("");

const workRoles = ref<WorkRole[]>(seedRoles(p));

const highestDegree = ref(p?.education?.degree ?? "");
const fieldOfStudy = ref(p?.education?.field ?? "");
const institution = ref(p?.education?.institution ?? "");
const graduationYear = ref(p?.education?.year ?? "");

const jobTitlesSeeking = ref(p?.job_titles_seeking?.join(", ") ?? "");
const remotePreference = ref<RemotePreference | "">(p?.remote_preference ?? "");
const salaryExpectation = ref(p?.salary_expectation ?? "");
const preferredLocations = ref(p?.preferred_locations?.join(", ") ?? "");

const email = computed<string>(() => props.userEmail ?? "");
const canAddRole = computed<boolean>(() => workRoles.value.length < MAX_ROLES);

const saving = ref(false);
const phase = ref<"saving" | "uploading">("saving");
const feedback = ref<{
  type: "success" | "error" | "warning";
  message: string;
} | null>(null);

const { saveProfile } = useProfile();

const inputClass =
  "w-full rounded-[9px] border-2 border-border bg-surface-2 px-3.5 py-[11px] text-[14.5px] text-text placeholder:text-text-3 transition-colors focus:border-accent-ink focus:outline-none";
const selectClass = `${inputClass} cursor-pointer appearance-none pr-9`;
const labelClass =
  "mb-[7px] block font-mono text-[10.5px] font-bold uppercase tracking-[0.05em] text-text-2";
const addButtonClass =
  "jz-frame-sm shrink-0 rounded-[9px] bg-surface px-4 py-[11px] text-[14px] font-semibold text-text transition-colors hover:bg-surface-sunk";
const sectionTitleClass =
  "font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-accent-ink";

function addSkill(): void {
  const value = skillInput.value.trim();
  if (!value) return;
  if (!skills.value.includes(value)) skills.value.push(value);
  skillInput.value = "";
}

function removeSkill(index: number): void {
  skills.value.splice(index, 1);
}

function addIndustry(): void {
  const value = industryInput.value.trim();
  if (!value) return;
  if (!industries.value.includes(value)) industries.value.push(value);
  industryInput.value = "";
}

function removeIndustry(index: number): void {
  industries.value.splice(index, 1);
}

function addRole(): void {
  if (!canAddRole.value) return;
  workRoles.value.push(emptyRole());
}

function removeRole(index: number): void {
  workRoles.value.splice(index, 1);
}

function csv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function orNull(value: string): string | null {
  return value.trim().length > 0 ? value.trim() : null;
}

function buildEducation(): Education | null {
  const degree = highestDegree.value.trim();
  const field = fieldOfStudy.value.trim();
  const inst = institution.value.trim();
  const year = graduationYear.value.trim();
  if (!degree && !field && !inst && !year) return null;
  return { degree, field, institution: inst, year };
}

function buildPayload(): ProfileUpdate {
  const yearsRaw = yearsExperience.value;
  const years =
    typeof yearsRaw === "number" ? yearsRaw : Number.parseInt(yearsRaw, 10);
  return {
    full_name: orNull(fullName.value),
    phone: orNull(phone.value),
    location: orNull(location.value),
    current_title: orNull(currentTitle.value),
    experience_level: experienceLevel.value || null,
    years_experience: Number.isFinite(years) ? Math.trunc(years) : null,
    skills: [...skills.value],
    industries: [...industries.value],
    work_experience: workRoles.value
      .filter(
        (role) =>
          role.company.trim() || role.title.trim() || role.responsibilities.trim(),
      )
      .map((role) => ({
        company: role.company.trim(),
        title: role.title.trim(),
        start_date: role.startDate,
        end_date: role.currentlyWorking ? null : role.endDate || null,
        currently_working: role.currentlyWorking,
        responsibilities: role.responsibilities.trim(),
      })),
    education: buildEducation(),
    job_titles_seeking: csv(jobTitlesSeeking.value),
    remote_preference: remotePreference.value || null,
    preferred_locations: csv(preferredLocations.value),
    salary_expectation: orNull(salaryExpectation.value),
    linkedin_url: orNull(linkedinUrl.value),
    portfolio_url: orNull(portfolioUrl.value),
    work_authorization: workAuthorization.value || null,
  };
}

async function handleSubmit(): Promise<void> {
  if (saving.value) return;
  saving.value = true;
  phase.value = "saving";
  feedback.value = null;

  const result = await saveProfile(buildPayload(), props.resumeFile, (p) => {
    phase.value = p;
  });
  saving.value = false;

  if (result.success && result.data) {
    feedback.value = result.warning
      ? { type: "warning", message: result.warning }
      : { type: "success", message: "Profile saved." };
    emit("saved", result.data);
  } else {
    feedback.value = {
      type: "error",
      message: result.error ?? "Could not save your profile.",
    };
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="jz-frame-lg rounded-[14px] bg-surface p-6">
      <h2 class="font-display text-[19px] font-bold text-text">
        Profile Information
      </h2>
      <p class="mt-1.5 text-[14px] leading-5 text-text-2">
        This context is used to accurately represent you to agent interactions.
      </p>

      <!-- Personal Info -->
      <section class="mt-6 border-t-2 border-border-soft pt-[18px]">
        <h3 :class="sectionTitleClass">Personal Info</h3>
        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label :class="labelClass" for="full-name">Full Name</label>
            <input id="full-name" v-model="fullName" type="text" :class="inputClass" placeholder="Jane Doe" />
          </div>
          <div>
            <label :class="labelClass" for="email">Email</label>
            <input
              id="email"
              :value="email"
              type="email"
              disabled
              readonly
              class="w-full cursor-not-allowed rounded-[9px] border-2 border-border bg-surface-sunk px-3.5 py-[11px] text-[14.5px] text-text-3"
            />
          </div>
          <div>
            <label :class="labelClass" for="phone">Phone Number</label>
            <input id="phone" v-model="phone" type="tel" :class="inputClass" placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label :class="labelClass" for="location">Location</label>
            <input id="location" v-model="location" type="text" :class="inputClass" placeholder="City, Country" />
          </div>
          <div>
            <label :class="labelClass" for="linkedin">LinkedIn URL</label>
            <input id="linkedin" v-model="linkedinUrl" type="url" :class="inputClass" placeholder="https://linkedin.com/in/username" />
          </div>
          <div>
            <label :class="labelClass" for="portfolio">Portfolio / GitHub</label>
            <input id="portfolio" v-model="portfolioUrl" type="url" :class="inputClass" placeholder="https://github.com/username" />
          </div>
          <div>
            <label :class="labelClass" for="work-auth">Work Authorization</label>
            <div class="relative">
              <select id="work-auth" v-model="workAuthorization" :class="selectClass">
                <option value="">Select…</option>
                <option v-for="option in WORK_AUTHORIZATIONS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Professional Info -->
      <section class="mt-8 border-t-2 border-border-soft pt-[18px]">
        <h3 :class="sectionTitleClass">Professional Info</h3>
        <div class="mt-4 flex flex-col gap-4">
          <div>
            <label :class="labelClass" for="current-title">Current / Recent Job Title</label>
            <input id="current-title" v-model="currentTitle" type="text" :class="inputClass" placeholder="e.g. Frontend Engineer" />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label :class="labelClass" for="experience-level">Experience Level</label>
              <div class="relative">
                <select id="experience-level" v-model="experienceLevel" :class="selectClass">
                  <option value="">Select…</option>
                  <option v-for="option in EXPERIENCE_LEVELS" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
            <div>
              <label :class="labelClass" for="years-experience">Years of Experience</label>
              <input id="years-experience" v-model="yearsExperience" type="number" min="0" :class="inputClass" placeholder="0" />
            </div>
          </div>

          <div>
            <label :class="labelClass" for="skill-input">Skills</label>
            <div class="flex gap-2">
              <input
                id="skill-input"
                v-model="skillInput"
                type="text"
                :class="inputClass"
                placeholder="Add a skill"
                @keydown.enter.prevent="addSkill"
              />
              <button type="button" :class="addButtonClass" @click="addSkill">Add</button>
            </div>
            <div v-if="skills.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="(skill, index) in skills"
                :key="skill"
                class="inline-flex items-center gap-1.5 rounded-lg border-2 border-border bg-accent-soft px-3 py-[7px] text-[13px] font-semibold text-accent-ink"
              >
                {{ skill }}
                <button type="button" class="text-accent-ink transition-opacity hover:opacity-70" :aria-label="`Remove ${skill}`" @click="removeSkill(index)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" aria-hidden="true">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </span>
            </div>
          </div>

          <div>
            <label :class="labelClass" for="industry-input">Industries Worked In (Optional)</label>
            <div class="flex gap-2">
              <input
                id="industry-input"
                v-model="industryInput"
                type="text"
                :class="inputClass"
                placeholder="E.g. FinTech, Healthcare"
                @keydown.enter.prevent="addIndustry"
              />
              <button type="button" :class="addButtonClass" @click="addIndustry">Add</button>
            </div>
            <div v-if="industries.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="(industry, index) in industries"
                :key="industry"
                class="inline-flex items-center gap-1.5 rounded-lg border-2 border-border bg-accent-soft px-3 py-[7px] text-[13px] font-semibold text-accent-ink"
              >
                {{ industry }}
                <button type="button" class="text-accent-ink transition-opacity hover:opacity-70" :aria-label="`Remove ${industry}`" @click="removeIndustry(index)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" aria-hidden="true">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Work Experience -->
      <section class="mt-8 border-t-2 border-border-soft pt-[18px]">
        <div class="flex items-center justify-between">
          <h3 :class="sectionTitleClass">Work Experience</h3>
          <button
            v-if="canAddRole"
            type="button"
            class="inline-flex items-center gap-1 text-[13px] font-semibold text-accent-ink transition-opacity hover:opacity-80"
            @click="addRole"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add role
          </button>
        </div>

        <div class="mt-4 flex flex-col gap-4">
          <div
            v-for="(role, index) in workRoles"
            :key="index"
            class="rounded-[11px] border-2 border-border bg-surface-sunk p-[18px]"
          >
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label :class="labelClass">Company Name</label>
                <input v-model="role.company" type="text" :class="inputClass" placeholder="e.g. Vercel" />
              </div>
              <div>
                <label :class="labelClass">Job Title</label>
                <input v-model="role.title" type="text" :class="inputClass" placeholder="e.g. Frontend Engineer" />
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label :class="labelClass">Start Date</label>
                <input v-model="role.startDate" type="month" :class="inputClass" />
              </div>
              <div>
                <div class="mb-1.5 flex items-center justify-between">
                  <label class="font-mono text-[10.5px] font-bold uppercase tracking-[0.05em] text-text-2">End Date</label>
                  <label class="flex items-center gap-2 text-[12px] font-medium text-text-2">
                    <input v-model="role.currentlyWorking" type="checkbox" class="h-4 w-4 rounded border-border accent-accent" />
                    Currently working here
                  </label>
                </div>
                <input
                  v-model="role.endDate"
                  type="month"
                  :class="inputClass"
                  :disabled="role.currentlyWorking"
                  class="disabled:cursor-not-allowed disabled:bg-surface-sunk disabled:text-text-3"
                />
              </div>
            </div>

            <div class="mt-4">
              <label :class="labelClass">Key Responsibilities</label>
              <textarea
                v-model="role.responsibilities"
                rows="3"
                :class="inputClass"
                class="resize-y"
                placeholder="Describe your main responsibilities and achievements."
              />
            </div>

            <div v-if="workRoles.length > 1" class="mt-3 flex justify-end">
              <button
                type="button"
                class="text-[12px] font-semibold text-text-2 transition-colors hover:text-error"
                @click="removeRole(index)"
              >
                Remove role
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Education -->
      <section class="mt-8 border-t-2 border-border-soft pt-[18px]">
        <h3 :class="sectionTitleClass">Education</h3>
        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label :class="labelClass" for="degree">Highest Degree</label>
            <div class="relative">
              <select id="degree" v-model="highestDegree" :class="selectClass">
                <option value="">Select…</option>
                <option v-for="option in DEGREE_OPTIONS" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
          <div>
            <label :class="labelClass" for="field-of-study">Field of Study</label>
            <input id="field-of-study" v-model="fieldOfStudy" type="text" :class="inputClass" placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label :class="labelClass" for="institution">Institution Name</label>
            <input id="institution" v-model="institution" type="text" :class="inputClass" placeholder="E.g. State University" />
          </div>
          <div>
            <label :class="labelClass" for="graduation-year">Graduation Year</label>
            <input id="graduation-year" v-model="graduationYear" type="text" inputmode="numeric" :class="inputClass" placeholder="YYYY" />
          </div>
        </div>
      </section>

      <!-- Job Preferences -->
      <section class="mt-8 border-t-2 border-border-soft pt-[18px]">
        <h3 :class="sectionTitleClass">Job Preferences</h3>
        <div class="mt-4 flex flex-col gap-4">
          <div>
            <label :class="labelClass" for="titles-seeking">Job Titles Seeking</label>
            <input id="titles-seeking" v-model="jobTitlesSeeking" type="text" :class="inputClass" placeholder="e.g. Frontend Engineer, React Developer" />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label :class="labelClass" for="remote-preference">Remote Preference</label>
              <div class="relative">
                <select id="remote-preference" v-model="remotePreference" :class="selectClass">
                  <option value="">Select…</option>
                  <option v-for="option in REMOTE_PREFERENCES" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
            <div>
              <label :class="labelClass" for="salary">Salary Expectation (Optional)</label>
              <input id="salary" v-model="salaryExpectation" type="text" :class="inputClass" placeholder="E.g. $120k" />
            </div>
          </div>

          <div>
            <label :class="labelClass" for="preferred-locations">Preferred Locations (Optional)</label>
            <input id="preferred-locations" v-model="preferredLocations" type="text" :class="inputClass" placeholder="E.g. New York, London" />
          </div>
        </div>
      </section>
    </div>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <p
        v-if="feedback"
        :role="feedback.type === 'error' ? 'alert' : 'status'"
        class="text-[13px] font-semibold"
        :class="{
          'text-error': feedback.type === 'error',
          'text-fair-ink': feedback.type === 'warning',
          'text-good-ink': feedback.type === 'success',
        }"
      >
        {{ feedback.message }}
      </p>
      <button
        type="submit"
        :disabled="saving"
        class="jz-frame jz-press w-full rounded-[11px] bg-accent px-6 py-3.5 font-display text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {{ saving ? (phase === "uploading" ? "Uploading résumé…" : "Saving…") : "Save Profile" }}
      </button>
    </div>
  </form>
</template>
