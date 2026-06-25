// Global types shared across the project (app/, server/, agent/).
// These mirror the InsForge database schema created in feature 04.
// Keep this file in sync with context/architecture.md — it is the source of
// truth for table row shapes. jsonb column shapes follow context/build-plan.md.

export type ExperienceLevel = "junior" | "mid" | "senior" | "lead";
export type RemotePreference = "remote" | "onsite" | "hybrid" | "any";
export type CoverLetterTone = "formal" | "casual" | "enthusiastic";
export type WorkAuthorization = "citizen" | "permanent_resident" | "visa_required";
export type AgentRunStatus = "running" | "completed" | "failed";
export type AgentLogLevel = "info" | "success" | "warning" | "error";
export type JobSource = "search" | "url";

// profiles.work_experience jsonb — up to 3 roles
export type WorkExperienceEntry = {
  company: string;
  title: string;
  start_date: string;
  end_date: string | null;
  currently_working: boolean;
  responsibilities: string;
};

// profiles.education jsonb — single highest-education record
export type Education = {
  degree: string;
  field: string;
  institution: string;
  year: string;
};

// jobs.company_research jsonb — dossier produced by the research agent (feature 13)
export type CompanyResearch = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: ExperienceLevel | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: WorkExperienceEntry[] | null;
  education: Education | null;
  job_titles_seeking: string[] | null;
  remote_preference: RemotePreference | null;
  preferred_locations: string[] | null;
  salary_expectation: string | null;
  cover_letter_tone: CoverLetterTone | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: WorkAuthorization | null;
  resume_pdf_url: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type AgentRun = {
  id: string;
  user_id: string;
  status: AgentRunStatus | null;
  job_title_searched: string | null;
  location_searched: string | null;
  jobs_found: number;
  started_at: string;
  completed_at: string | null;
};

export type Job = {
  id: string;
  run_id: string | null;
  user_id: string;
  source: JobSource;
  source_url: string | null;
  external_apply_url: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  about_role: string | null;
  responsibilities: string[] | null;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  benefits: string[] | null;
  about_company: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  company_research: CompanyResearch | null;
  found_at: string;
};

// A single result from the Adzuna job search API (lib/adzuna.ts). Only the
// fields the find-agent reads are typed; Adzuna returns more.
export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string; // snippet only — not the full posting
  redirect_url: string; // Adzuna tracking URL → redirects to the real posting
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: "0" | "1"; // "1" = Adzuna estimated the salary
  contract_type?: string;
  created?: string; // ISO date string
  category?: { tag: string; label: string };
};

// Gemini's score of one job against the user's profile (server/utils/score-job.ts).
export type ScoredJob = {
  matchScore: number; // 0-100
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

export type AgentLog = {
  id: string;
  run_id: string | null;
  user_id: string;
  message: string | null;
  level: AgentLogLevel | null;
  job_id: string | null;
  created_at: string;
};

// Editable profile fields the form sends to server/api/profile.post.ts.
// Excludes server-owned columns: id, email (immutable, set at signup),
// resume_pdf_url (set by the upload route), is_complete (recomputed server-side),
// created_at, updated_at.
export type ProfileUpdate = {
  full_name: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: ExperienceLevel | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkExperienceEntry[];
  education: Education | null;
  job_titles_seeking: string[];
  remote_preference: RemotePreference | null;
  preferred_locations: string[];
  salary_expectation: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: WorkAuthorization | null;
};

// Derived completion state — never stored except is_complete. Drives the
// completion ring + missing-field tags (client) and the is_complete flag (server).
export type ProfileCompletion = {
  percentage: number;
  missingFields: string[];
  isComplete: boolean;
};

// Result of server/api/resume/extract — the fields the résumé yielded, which the
// profile form merges over the current values for the user to review and save.
// Only fields actually found are present, so missing ones leave the form as-is.
export type ExtractedProfile = Partial<{
  full_name: string;
  phone: string;
  location: string;
  current_title: string;
  experience_level: ExperienceLevel;
  years_experience: number;
  skills: string[];
  industries: string[];
  work_experience: WorkExperienceEntry[];
  education: Education;
  job_titles_seeking: string[];
  remote_preference: RemotePreference;
  preferred_locations: string[];
  salary_expectation: string;
  linkedin_url: string;
  portfolio_url: string;
  work_authorization: WorkAuthorization;
}>;
