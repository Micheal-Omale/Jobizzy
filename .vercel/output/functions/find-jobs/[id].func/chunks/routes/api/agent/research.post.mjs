import { d as defineEventHandler, c as createInsforgeServer, a as createError, r as readBody, f as createStagehand, h as getGemini, j as generateWithRetry, k as parseJsonLoose, b as createPostHogServer } from '../../../_/nitro.mjs';
import { z } from 'zod';
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

function extractRootDomain(url, fallbackCompany) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("adzuna.com")) {
      return `https://www.${fallbackCompany.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
    }
    const parts = parsed.hostname.split(".");
    if (parts.length > 2) {
      parts.shift();
    }
    return `https://${parts.join(".")}`;
  } catch {
    return `https://www.${fallbackCompany.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  }
}
const research_post = defineEventHandler(async (event) => {
  const insforge = createInsforgeServer(event);
  const { data: auth, error: authError } = await insforge.auth.getCurrentUser();
  const user = auth == null ? void 0 : auth.user;
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const body = await readBody(event);
  const jobId = body == null ? void 0 : body.jobId;
  if (!jobId) {
    throw createError({ statusCode: 400, statusMessage: "jobId is required" });
  }
  const { data: job, error: jobError } = await insforge.database.from("jobs").select("*").eq("id", jobId).eq("user_id", user.id).single();
  if (jobError || !job) {
    throw createError({ statusCode: 404, statusMessage: "Job not found" });
  }
  const { data: profile, error: profileError } = await insforge.database.from("profiles").select("*").eq("id", user.id).single();
  if (profileError || !profile) {
    throw createError({ statusCode: 404, statusMessage: "Profile not found" });
  }
  let finalUrl = `https://www.${(job.company || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  if (job.source_url) {
    try {
      const response2 = await fetch(job.source_url, { redirect: "follow" });
      finalUrl = extractRootDomain(response2.url, job.company || "company");
    } catch (e) {
      console.warn("[api/agent/research] fetch redirect failed", e);
    }
  }
  const companyResearch = { url: finalUrl };
  const stagehand = createStagehand();
  try {
    await stagehand.init();
    const page = stagehand.context.pages()[0];
    if (!page) throw new Error("Stagehand failed to initialize a page context");
    await page.goto(finalUrl, { waitUntil: "domcontentloaded" });
    const homepageData = await stagehand.extract(
      "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
      z.object({
        oneLiner: z.string().describe("What the company does in one sentence").optional(),
        productSummary: z.string().describe("What they build/sell and who it's for").optional(),
        signals: z.array(z.string()).describe("Funding, notable customers, scale, mission, recent news").optional(),
        pageLinks: z.array(
          z.object({
            url: z.string(),
            kind: z.enum(["about", "careers", "blog", "engineering", "product", "team", "other"])
          })
        ).describe("Internal links worth visiting").optional()
      })
    );
    if (homepageData && (homepageData.oneLiner || homepageData.productSummary)) {
      companyResearch.homepage = homepageData;
      companyResearch.subpages = [];
      const preferredKinds = ["about", "product", "engineering", "blog", "team", "careers", "other"];
      const sortedLinks = (homepageData.pageLinks || []).sort((a, b) => {
        return preferredKinds.indexOf(a.kind) - preferredKinds.indexOf(b.kind);
      });
      const topLinks = sortedLinks.slice(0, 3);
      for (const link of topLinks) {
        try {
          let navUrl = link.url;
          if (navUrl.startsWith("/")) {
            navUrl = new URL(navUrl, finalUrl).toString();
          }
          await page.goto(navUrl, { waitUntil: "domcontentloaded" });
          const subPageData = await stagehand.extract(
            "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
            z.object({
              keyPoints: z.array(z.string()).optional(),
              technologies: z.array(z.string()).describe("Specific languages, frameworks, tools, platforms").optional(),
              valuesOrCulture: z.array(z.string()).describe("Stated values, working style, team norms").optional(),
              notable: z.array(z.string()).describe("Customers, funding, scale, projects, awards").optional()
            })
          );
          companyResearch.subpages.push({ url: navUrl, kind: link.kind, data: subPageData });
        } catch (subErr) {
          console.warn(`[api/agent/research] Extract failed for ${link.url}`, subErr);
        }
      }
    }
  } catch (err) {
    console.error("[api/agent/research] Stagehand failure", err);
  } finally {
    await stagehand.close();
  }
  const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;
  const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.about_role}
Matched skills: ${(job.matched_skills || []).join(", ")}
Missing skills: ${(job.missing_skills || []).join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${(profile.skills || []).join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;
  const ai = getGemini();
  const response = await generateWithRetry(ai, {
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.4
    }
  });
  const dossier = parseJsonLoose(response.text);
  const { error: updateError } = await insforge.database.from("jobs").update({ company_research: dossier }).eq("id", jobId).eq("user_id", user.id);
  if (updateError) {
    console.error("[api/agent/research] DB update error", updateError);
    throw createError({ statusCode: 500, statusMessage: "Could not save company research" });
  }
  const posthog = createPostHogServer();
  posthog.capture({
    distinctId: user.id,
    event: "company_researched",
    properties: { userId: user.id, jobId, company: job.company }
  });
  await posthog.shutdown();
  return { success: true, dossier };
});

export { research_post as default };
//# sourceMappingURL=research.post.mjs.map
