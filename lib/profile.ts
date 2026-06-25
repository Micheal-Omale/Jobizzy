// Shared profile logic used by both the client (form options + completion ring)
// and the server (enum validation + the persisted is_complete flag). Keeping it
// in one place is what prevents the banner and the DB from disagreeing.

import type {
  Education,
  ExperienceLevel,
  ProfileCompletion,
  RemotePreference,
  WorkAuthorization,
  WorkExperienceEntry,
} from "~~/types";

type Option<T extends string> = { value: T; label: string };

export const EXPERIENCE_LEVELS: Option<ExperienceLevel>[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

export const REMOTE_PREFERENCES: Option<RemotePreference>[] = [
  { value: "any", label: "Any" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
];

export const WORK_AUTHORIZATIONS: Option<WorkAuthorization>[] = [
  { value: "citizen", label: "Citizen" },
  { value: "permanent_resident", label: "Permanent Resident" },
  { value: "visa_required", label: "Visa Required" },
];

export const DEGREE_OPTIONS: string[] = [
  "High School",
  "Associate's",
  "Bachelor's",
  "Master's",
  "PhD",
  "Other",
];

// The fields a profile must have to count as complete. A subset of Profile that
// both the full DB row and the editable ProfileUpdate satisfy structurally.
type CompletionInput = {
  full_name: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: ExperienceLevel | null;
  years_experience: number | null;
  skills: string[] | null;
  work_experience: WorkExperienceEntry[] | null;
  education: Education | null;
  job_titles_seeking: string[] | null;
};

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasCompleteRole(roles: WorkExperienceEntry[] | null): boolean {
  return (
    Array.isArray(roles) &&
    roles.some((role) => hasText(role.company) && hasText(role.title))
  );
}

// Order here is the order missing-field tags appear in the banner.
export function computeProfileCompletion(
  input: CompletionInput,
): ProfileCompletion {
  const checks: { label: string; filled: boolean }[] = [
    { label: "Name", filled: hasText(input.full_name) },
    { label: "Phone", filled: hasText(input.phone) },
    { label: "Location", filled: hasText(input.location) },
    { label: "Job Title", filled: hasText(input.current_title) },
    { label: "Experience", filled: input.experience_level !== null },
    { label: "Years", filled: input.years_experience !== null },
    { label: "Skills", filled: (input.skills?.length ?? 0) > 0 },
    { label: "Work History", filled: hasCompleteRole(input.work_experience) },
    { label: "Education", filled: hasText(input.education?.institution) },
    {
      label: "Target Roles",
      filled: (input.job_titles_seeking?.length ?? 0) > 0,
    },
  ];

  const filled = checks.filter((check) => check.filled).length;
  const percentage = Math.round((filled / checks.length) * 100);
  const missingFields = checks
    .filter((check) => !check.filled)
    .map((check) => check.label);

  return { percentage, missingFields, isComplete: filled === checks.length };
}
