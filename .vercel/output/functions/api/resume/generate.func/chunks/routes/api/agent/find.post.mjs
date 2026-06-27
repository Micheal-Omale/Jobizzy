import { d as defineEventHandler, c as createInsforgeServer, a as createError, r as readBody, b as createPostHogServer, s as scoreJob, i as isTransientError, e as useRuntimeConfig } from '../../../_/nitro.mjs';
import '@browserbasehq/stagehand';
import '@google/genai';
import 'pdfmake/src/printer.js';
import '@insforge/sdk/ssr';
import 'posthog-node';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@posthog/core/vendor/uuidv7';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const COUNTRY_KEYWORDS = {
  gb: ["united kingdom", "uk", "england", "scotland", "wales", "london", "manchester", "britain"],
  au: ["australia", "sydney", "melbourne", "brisbane", "perth"],
  ca: ["canada", "toronto", "vancouver", "montreal", "ottawa", "calgary"]
};
function detectCountry(location) {
  const haystack = location.trim().toLowerCase();
  if (!haystack) return "us";
  for (const [code, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) return code;
  }
  return "us";
}
async function searchJobs(jobTitle, location, appId, appKey, country = detectCountry(location)) {
  var _a;
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category: "it-jobs",
    // always filter to IT jobs
    results_per_page: "10",
    "content-type": "application/json"
  });
  if (location.trim()) {
    params.set("where", location.trim());
  }
  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Adzuna API error: ${response.status}${detail ? ` \u2014 ${detail.slice(0, 200)}` : ""}`);
  }
  const data = await response.json();
  return (_a = data.results) != null ? _a : [];
}
function formatSalary(min, max) {
  if (!min) return null;
  const lo = `$${Math.round(min / 1e3)}k`;
  const hi = max ? `$${Math.round(max / 1e3)}k` : null;
  return hi ? `${lo} - ${hi}` : lo;
}

const MATCH_THRESHOLD = 70;

const SCORE_DELAY_MS = 2500;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const find_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  const insforge = createInsforgeServer(event);
  const { data: auth, error: authError } = await insforge.auth.getCurrentUser();
  const user = auth == null ? void 0 : auth.user;
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const body = await readBody(event);
  const jobTitle = (_a = body == null ? void 0 : body.jobTitle) == null ? void 0 : _a.trim();
  const location = (_c = (_b = body == null ? void 0 : body.location) == null ? void 0 : _b.trim()) != null ? _c : "";
  if (!jobTitle) {
    throw createError({ statusCode: 400, statusMessage: "A job title is required." });
  }
  const { data: profile, error: profileError } = await insforge.database.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profileError) {
    console.error("[api/agent/find] profile", profileError);
    throw createError({ statusCode: 502, statusMessage: "Could not load your profile." });
  }
  const hasProfileSignal = !!profile && (((_e = (_d = profile.skills) == null ? void 0 : _d.length) != null ? _e : 0) > 0 || !!profile.current_title);
  if (!hasProfileSignal) {
    throw createError({
      statusCode: 400,
      statusMessage: "Complete your profile (skills and current title) before searching."
    });
  }
  const config = useRuntimeConfig();
  const posthog = createPostHogServer();
  let runId = null;
  try {
    posthog.capture({
      distinctId: user.id,
      event: "job_search_started",
      properties: { userId: user.id, jobTitle, location }
    });
    const { data: run, error: runError } = await insforge.database.from("agent_runs").insert({
      user_id: user.id,
      status: "running",
      job_title_searched: jobTitle,
      location_searched: location || null,
      started_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (runError || !run) {
      throw createError({ statusCode: 502, statusMessage: "Could not start the search." });
    }
    runId = run.id;
    const adzunaJobs = await searchJobs(jobTitle, location, config.adzunaAppId, config.adzunaAppKey);
    let strongMatches = 0;
    let savedCount = 0;
    for (let i = 0; i < adzunaJobs.length; i++) {
      const job = adzunaJobs[i];
      if (i > 0) await delay(SCORE_DELAY_MS);
      let scored;
      try {
        scored = await scoreJob(job, profile);
      } catch (scoreError) {
        console.error("[api/agent/find] score", scoreError);
        continue;
      }
      const { error: insertError } = await insforge.database.from("jobs").insert({
        user_id: user.id,
        run_id: runId,
        source: "search",
        source_url: (_f = job.redirect_url) != null ? _f : null,
        external_apply_url: (_g = job.redirect_url) != null ? _g : null,
        title: (_h = job.title) != null ? _h : null,
        company: (_j = (_i = job.company) == null ? void 0 : _i.display_name) != null ? _j : null,
        location: (_l = (_k = job.location) == null ? void 0 : _k.display_name) != null ? _l : null,
        salary: formatSalary(job.salary_min, job.salary_max),
        job_type: (_m = job.contract_type) != null ? _m : "fulltime",
        about_role: (_n = job.description) != null ? _n : null,
        match_score: scored.matchScore,
        match_reason: scored.matchReason,
        matched_skills: scored.matchedSkills,
        missing_skills: scored.missingSkills,
        found_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (insertError) {
        console.error("[api/agent/find] job insert", insertError);
        continue;
      }
      savedCount++;
      if (scored.matchScore >= MATCH_THRESHOLD) strongMatches++;
      posthog.capture({
        distinctId: user.id,
        event: "job_found",
        properties: { userId: user.id, source: "search", matchScore: scored.matchScore }
      });
    }
    await insforge.database.from("agent_runs").update({
      status: "completed",
      jobs_found: savedCount,
      completed_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", runId).eq("user_id", user.id);
    return { runId, count: savedCount, strongMatches };
  } catch (error) {
    if (runId) {
      await insforge.database.from("agent_runs").update({ status: "failed", completed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", runId).eq("user_id", user.id).then(void 0, () => {
      });
    }
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    console.error("[api/agent/find]", error);
    const busy = isTransientError(error);
    throw createError({
      statusCode: busy ? 503 : 502,
      statusMessage: busy ? "The job agent is busy right now. Please try again in a moment." : "The job search could not be completed. Please try again."
    });
  } finally {
    await posthog.shutdown();
  }
});

export { find_post as default };
//# sourceMappingURL=find.post.mjs.map
