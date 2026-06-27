import { u as useInsforge } from './useInsforge-DhfvSzIK.mjs';
import { u as useAuth } from './useAuth-DqhK3zbv.mjs';

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function hasCompleteRole(roles) {
  return Array.isArray(roles) && roles.some((role) => hasText(role.company) && hasText(role.title));
}
function computeProfileCompletion(input) {
  const checks = [
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
      filled: (input.job_titles_seeking?.length ?? 0) > 0
    }
  ];
  const filled = checks.filter((check) => check.filled).length;
  const percentage = Math.round(filled / checks.length * 100);
  const missingFields = checks.filter((check) => !check.filled).map((check) => check.label);
  return { percentage, missingFields, isComplete: filled === checks.length };
}
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 9e4;
const RESUME_PATH = (userId) => `${userId}/resume.pdf`;
function useProfile() {
  const insforge = useInsforge();
  const { user } = useAuth();
  async function fetchProfile() {
    const userId = user.value?.id;
    if (!userId) return { success: false, error: "You are not signed in." };
    try {
      const { data, error } = await insforge.database.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) {
        console.error("[composables/useProfile] fetchProfile", error);
        return { success: false, error: "Could not load your profile." };
      }
      return { success: true, data: data ?? void 0 };
    } catch (error) {
      console.error("[composables/useProfile] fetchProfile", error);
      return { success: false, error: "Could not load your profile." };
    }
  }
  async function uploadResume(userId, file) {
    if (file.type !== "application/pdf") return { error: "Résumé must be a PDF." };
    if (file.size > MAX_RESUME_BYTES) return { error: "Résumé must be 5MB or smaller." };
    const path = RESUME_PATH(userId);
    await insforge.storage.from("resumes").remove(path);
    const timeout = new Promise(
      (resolve) => setTimeout(() => resolve("timeout"), UPLOAD_TIMEOUT_MS)
    );
    const outcome = await Promise.race([
      insforge.storage.from("resumes").upload(path, file),
      timeout
    ]);
    if (outcome === "timeout") {
      return { error: "the upload timed out — try it again." };
    }
    if (outcome.error || !outcome.data) {
      console.error("[composables/useProfile] uploadResume", outcome.error);
      return { error: "the upload failed." };
    }
    return { url: outcome.data.url };
  }
  async function saveProfile(update, resumeFile, onPhase) {
    const userId = user.value?.id;
    if (!userId) return { success: false, error: "You are not signed in." };
    try {
      const row = {
        id: userId,
        email: user.value?.email ?? null,
        ...update,
        is_complete: computeProfileCompletion(update).isComplete
      };
      const { data, error } = await insforge.database.from("profiles").upsert(row).select().single();
      if (error) {
        console.error("[composables/useProfile] saveProfile", error);
        return { success: false, error: "Could not save your profile." };
      }
      if (!resumeFile) return { success: true, data };
      onPhase?.("uploading");
      const uploaded = await uploadResume(userId, resumeFile);
      if ("error" in uploaded) {
        return { success: true, data, warning: `Profile saved, but ${uploaded.error}` };
      }
      const { data: withResume, error: linkError } = await insforge.database.from("profiles").update({ resume_pdf_url: uploaded.url }).eq("id", userId).select().single();
      if (linkError) {
        console.error("[composables/useProfile] saveProfile link", linkError);
        return { success: true, data, warning: "Profile saved, but the résumé link could not be stored." };
      }
      return { success: true, data: withResume };
    } catch (error) {
      console.error("[composables/useProfile] saveProfile", error);
      return { success: false, error: "Could not save your profile." };
    }
  }
  async function getResumeObjectUrl() {
    const userId = user.value?.id;
    if (!userId) return { error: "You are not signed in." };
    try {
      const { data, error } = await insforge.storage.from("resumes").download(RESUME_PATH(userId));
      if (error || !data) {
        console.error("[composables/useProfile] getResumeObjectUrl", error);
        return { error: "Could not open your résumé." };
      }
      const pdf = data.type === "application/pdf" ? data : new Blob([data], { type: "application/pdf" });
      return { url: URL.createObjectURL(pdf) };
    } catch (error) {
      console.error("[composables/useProfile] getResumeObjectUrl", error);
      return { error: "Could not open your résumé." };
    }
  }
  async function extractFromResume(file) {
    let pdfFile = file;
    if (!pdfFile) {
      const userId = user.value?.id;
      if (!userId) return { error: "You are not signed in." };
      const { data, error } = await insforge.storage.from("resumes").download(RESUME_PATH(userId));
      if (error || !data) {
        return { error: "Upload a résumé first, then extract." };
      }
      pdfFile = new File([data], "resume.pdf", { type: "application/pdf" });
    }
    try {
      const form = new FormData();
      form.append("resume", pdfFile);
      const result = await $fetch("/api/resume/extract", {
        method: "POST",
        body: form
      });
      return { data: result.data };
    } catch (error) {
      console.error("[composables/useProfile] extractFromResume", error);
      const data = error?.data;
      return { error: data?.message ?? data?.statusMessage ?? "Could not read your résumé. Please try again." };
    }
  }
  async function generateResume(profile) {
    const userId = user.value?.id;
    if (!userId) return { error: "You are not signed in." };
    const hasRole = (profile.work_experience ?? []).some((role) => role?.company || role?.title);
    if (!profile.full_name?.trim() || !profile.current_title?.trim() || !hasRole) {
      return {
        error: "Add your name, current title, and at least one work experience entry before generating a résumé."
      };
    }
    let pdf;
    try {
      const blob = await $fetch("/api/resume/generate", {
        method: "POST",
        body: profile,
        responseType: "blob"
      });
      pdf = blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });
    } catch (error) {
      console.error("[composables/useProfile] generateResume", error);
      const data = error?.data;
      return { error: data?.message ?? data?.statusMessage ?? "Could not generate your résumé. Please try again." };
    }
    const file = new File([pdf], "resume.pdf", { type: "application/pdf" });
    const uploaded = await uploadResume(userId, file);
    if ("error" in uploaded) return { error: `Résumé generated, but ${uploaded.error}` };
    const { error: linkError } = await insforge.database.from("profiles").update({ resume_pdf_url: uploaded.url }).eq("id", userId);
    if (linkError) {
      console.error("[composables/useProfile] generateResume link", linkError);
      return { error: "Résumé generated, but the link could not be saved." };
    }
    return { viewUrl: URL.createObjectURL(pdf), resumeUrl: uploaded.url };
  }
  return { fetchProfile, saveProfile, getResumeObjectUrl, extractFromResume, generateResume };
}

export { computeProfileCompletion as c, useProfile as u };
//# sourceMappingURL=useProfile-BIz0kmkh.mjs.map
