# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to Jobizzy.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## InsForge

**Check first:** Check AGENTS.md for an installed InsForge skill. If an InsForge MCP server is configured — use it. The skill/MCP will have the latest API patterns.

### Client vs Server (SSR auth — verified against the installed SDK, feature 10)

SSR lives at the **`@insforge/sdk/ssr`** subpath — it is part of `@insforge/sdk` (already installed), **NOT** a separate `@insforge/ssr` package. The session lives in cookies: non-httpOnly `insforge_access_token` (bearer the browser client reads for DB/Storage/Functions) + httpOnly `insforge_refresh_token` (server-owned). Both clients take a **single options object** (`{ baseUrl, anonKey, … }`), not positional args.

```typescript
// app/composables/useInsforge.ts — browser context only. auth is READ-ONLY here
// (getCurrentUser); sign-in / OAuth exchange / sign-out run server-side.
import { createBrowserClient } from "@insforge/sdk/ssr";

export function useInsforge() {
  const config = useRuntimeConfig();
  return createBrowserClient({
    baseUrl: config.public.insforgeUrl,
    anonKey: config.public.insforgeAnonKey,
    refreshUrl: "/api/auth/refresh", // a Nitro route; client hits it to refresh
  });
}
```

```typescript
// server/utils/insforge.ts — server context only. Reads the access-token cookie
// and uses it as the per-request bearer (cookies takes a `get`, not getAll/setAll).
import { createServerClient } from "@insforge/sdk/ssr";
import { getCookie, type H3Event } from "h3";

export function createInsforgeServer(event: H3Event) {
  const config = useRuntimeConfig();
  return createServerClient({
    baseUrl: config.public.insforgeUrl,
    anonKey: config.public.insforgeAnonKey,
    cookies: { get: (name: string) => getCookie(event, name) },
  });
}
```

**Auth mutations are server-side** via `createAuthActions({ baseUrl, anonKey, cookies })` (cookies = an h3 read+write `CookieStore` adapter). OAuth is PKCE and must be initiated AND exchanged on the server — SSR browser clients do not auto-exchange callbacks. See `server/api/auth/{oauth-start,oauth-callback,refresh,signout}.post.ts`.

**Rules:**

- Browser client — components, composables, browser-side session reads (`getCurrentUser`), realtime
- Server client — Nitro route handlers (`server/api/`), agent functions; the ONLY way to act as the user
- Never use browser client in server context, or server client in browser context
- Never call `signInWithOAuth`/`signOut` on the browser client — they are not on its `auth` surface in SSR mode

---

### Auth

```typescript
// Get current user in server context (inside a Nitro route handler)
const insforge = createInsforgeServer(event);
const {
  data: { user },
  error,
} = await insforge.auth.getCurrentUser();
if (!user) {
  throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
}
```

---

### DB Queries

The DB accessor is **`insforge.database.from(...)`** (same on browser and server clients). Inserts take an **object** (not an array).

```typescript
// Read
const { data, error } = await insforge.database
  .from("jobs")
  .select("*")
  .eq("user_id", user.id)
  .order("found_at", { ascending: false });

// Insert (object form)
const { data, error } = await insforge.database
  .from("jobs")
  .insert({ user_id: user.id, title, company, match_score })
  .select()
  .single();

// Update
const { error } = await insforge.database
  .from("jobs")
  .update({ company_research: dossier })
  .eq("id", jobId)
  .eq("user_id", user.id); // always scope to user (profiles scope by `id`)
```

**Rules:**

- Always scope queries to the user — `user_id` for jobs/agent_runs, `id` for profiles
- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row, `.maybeSingle()` when a row may not exist

---

### Storage

```typescript
// Upload file
const { data, error } = await insforge.storage
  .from("resumes")
  .upload(`${userId}/resume.pdf`, fileBuffer, {
    contentType: "application/pdf",
    upsert: true, // overwrites existing file
  });

// Get public URL
const { data } = insforge.storage
  .from("resumes")
  .getPublicUrl(`${userId}/resume.pdf`);

const url = data.publicUrl;
```

**Storage paths:**

- Base resume: `resumes/{user_id}/resume.pdf`

**Rules:**

- Always use `upsert: true` for base resume uploads — overwrites existing file
- Always save the public URL back to the DB after upload
- Never write files to disk — always upload buffer directly to storage

---

## Adzuna API

**Check first:** Check AGENTS.md for an installed Adzuna skill. If none exists — use this file and the official Adzuna API docs.

### Job Search

```typescript
// lib/adzuna.ts
export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = "us",
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category: "it-jobs", // always filter to IT jobs
    results_per_page: "10",
    "content-type": "application/json",
  });

  // Only add where if location is provided
  if (location) {
    params.set("where", location);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}
```

### Response Shape

Each Adzuna job result contains:

```typescript
type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string; // snippet only — not full description
  redirect_url: string; // Adzuna tracking URL → redirects to actual job
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1"; // "1" means salary is estimated
  contract_type?: string;
  created: string; // ISO date string
  category: { tag: string; label: string };
};
```

### Saving Jobs to DB

```typescript
// Map Adzuna result to jobs table
const jobRecord = {
  user_id: userId,
  run_id: runId,
  source: "search", // always 'search' for Adzuna jobs
  source_url: job.redirect_url,
  external_apply_url: job.redirect_url,
  title: job.title,
  company: job.company.display_name,
  location: job.location.display_name,
  salary: job.salary_min
    ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max! / 1000)}k`
    : null,
  job_type: job.contract_type || "fulltime",
  about_role: job.description, // Adzuna returns snippet — used as description
  match_score: scoredJob.matchScore,
  match_reason: scoredJob.matchReason,
  matched_skills: scoredJob.matchedSkills,
  missing_skills: scoredJob.missingSkills,
  found_at: new Date().toISOString(),
};
```

**Rules:**

- Always include `category=it-jobs` — never search Adzuna without this filter
- Never pass `where` if location is empty — omit the parameter entirely
- `source` is always `'search'` for Adzuna jobs — never any other value
- `salary_is_predicted: "1"` means Adzuna estimated the salary — this is normal
- Adzuna description is a snippet — Gemini 2.5 scores from it, not a full description
- Default country to `'us'` — support `gb`, `au`, `ca` as alternatives
- **Implemented:** `lib/adzuna.ts` `searchJobs(jobTitle, location, appId, appKey, country?)` takes the keys as **params** (passed from `runtimeConfig.adzunaAppId/adzunaAppKey`), not `process.env`, so it stays testable. `detectCountry()`/`formatSalary()` live alongside it. Jobs are saved via `insforge.database.from("jobs").insert({...})` (object), `source:'search'`

---

## Browserless

Browserbase is unavailable in our region, so the company-research browser runs on **Browserless** instead. Browserless exposes a remote Chrome over a CDP WebSocket; Stagehand connects to it directly — there is no separate session-creation SDK call.

**Connection — Company Research**

```typescript
// CDP WebSocket endpoint. Cloud: wss://production-sfo.browserless.io?token=...
// Self-hosted: ws://<host>:3000?token=...
const cdpUrl = `${process.env.BROWSERLESS_WS_URL}?token=${process.env.BROWSERLESS_API_KEY}`;
```

**Important — how this differs from Browserbase:**
The browser process runs on Browserless's cloud, but **your Nitro handler drives it live over the CDP socket** — it is not fire-and-forget. The route handler must stay alive for the whole research run (~120s of page visits). Make Company Research a background/long-running task and stream/poll status to the UI; do not assume a serverless function with a short timeout can host it.

**Rules:**

- One CDP connection per research run — never open parallel browsers (free plan limit)
- Budget ~120 seconds — sufficient for 3-4 page visits
- Always end cleanly — call `stagehand.close()` (closes the Browserless browser)
- Endpoint + token always from `process.env.BROWSERLESS_WS_URL` / `BROWSERLESS_API_KEY` — never hardcode
- Browserless client lives in `server/utils/browserless.ts` — always import from there

---

## Stagehand

**Check first:** Check AGENTS.md for an installed Stagehand skill. If a Stagehand MCP server is configured — use it. The skill/MCP will have the latest act() and extract() patterns.

### Initialisation

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

const stagehand = new Stagehand({
  env: "LOCAL", // connect to a remote browser over CDP (Browserless)
  localBrowserLaunchOptions: {
    cdpUrl: `${process.env.BROWSERLESS_WS_URL}?token=${process.env.BROWSERLESS_API_KEY}`,
  },
  modelName: "google/gemini-2.5-flash",
  modelClientOptions: { apiKey: process.env.GEMINI_API_KEY! },
  disablePino: true,
});

await stagehand.init();
const page = stagehand.page;
```

### extract()

```typescript
import { z } from "zod";

const result = await stagehand.extract({
  instruction:
    "Extract the company overview, main product description, and any technology mentions from this page.",
  schema: z.object({
    companyOverview: z.string().optional(),
    mainProduct: z.string().optional(),
    techMentions: z.array(z.string()).optional(),
    navLinks: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .optional(),
  }),
});
```

### act()

```typescript
// Always wrap in try/catch
try {
  await stagehand.act({
    action: "Click the About link in the navigation",
  });
} catch (error) {
  await logAgentError(jobId, null, error);
}
```

## Company Research Section

Replace the existing Stagehand "Company Research Pattern" section in library-docs.md with this:

---

### Company Research Pattern

Three-step process: homepage extraction → sub-page extraction → Gemini 2.5 synthesis.
Job description and user profile come from DB — never re-fetch what you already have.
Browser's only job is the company website.

```typescript
// Step 1 — Homepage extraction
const homepageData = await stagehand.extract({
  instruction:
    "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
  schema: z.object({
    oneLiner: z.string().describe("What the company does in one sentence"),
    productSummary: z
      .string()
      .describe("What they build/sell and who it's for"),
    signals: z
      .array(z.string())
      .describe("Funding, notable customers, scale, mission, recent news"),
    pageLinks: z
      .array(
        z.object({
          url: z.string(),
          kind: z.enum([
            "about",
            "careers",
            "blog",
            "engineering",
            "product",
            "team",
            "other",
          ]),
        }),
      )
      .describe("Internal links worth visiting"),
  }),
});

// If oneLiner and productSummary are empty — wrong site or parked domain
// Skip to synthesis with job description and profile only
if (!homepageData.oneLiner && !homepageData.productSummary) {
  await stagehand.close();
  // proceed to synthesis with empty companyResearch
}

// Step 2 — Sub-page extraction (max 3, prefer about/blog/engineering/product over careers)
const subPageData = await stagehand.extract({
  instruction:
    "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
  schema: z.object({
    keyPoints: z.array(z.string()),
    technologies: z
      .array(z.string())
      .describe("Specific languages, frameworks, tools, platforms"),
    valuesOrCulture: z
      .array(z.string())
      .describe("Stated values, working style, team norms"),
    notable: z
      .array(z.string())
      .describe("Customers, funding, scale, projects, awards"),
  }),
});

// Step 3 — Gemini 2.5 synthesis (after browser closes)
// Feed three data sources: company research + job from DB + profile from DB
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
Description: ${job.description}
Matched skills (already computed): ${job.matched_skills.join(", ")}
Missing skills (already computed): ${job.missing_skills.join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${profile.skills.join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

const ai = getGemini(); // shared GoogleGenAI client — server/utils/gemini.ts
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: userPrompt,
  config: {
    systemInstruction: systemPrompt,
    responseMimeType: "application/json",
    temperature: 0.4,
  },
});
const dossier = JSON.parse(response.text!);
```

**Dossier fields:**

| Field           | Type     | Purpose                                             |
| --------------- | -------- | --------------------------------------------------- |
| companyOverview | string   | What the company does                               |
| techStack       | string[] | Technologies they use                               |
| culture         | string[] | Values and working style                            |
| whyThisRole     | string   | Why this role exists                                |
| yourEdge        | string[] | Specific links between THIS candidate and this role |
| gapsToAddress   | string[] | Missing skills reframed as strategy                 |
| smartQuestions  | string[] | Questions that show real research                   |
| interviewPrep   | string[] | Topics to prepare for this role                     |
| sources         | string[] | Pages the company info came from                    |

**Rules:**

- Always use `extract()` with a Zod schema — never parse raw HTML or use regex
- Always wrap every `act()` and `extract()` in try/catch
- Always call `await stagehand.close()` when done — closes the Browserless browser
- Model is always `gemini-2.5-flash` — never use other models
- Temperature is `0.4` for synthesis — grounded but flexible enough to make real connections
- Max 3 sub-pages — never exceed this on free plan
- Always close the browser in a finally block — never leave a Browserless browser open even if research fails
- Job description and profile always come from DB — never re-fetch via browser
- If browser research returns empty — still run synthesis with job + profile only
- yourEdge, gapsToAddress, and smartQuestions are the most valuable fields — never skip them

## Gemini 2.5

**Check first:** Use the shared `GoogleGenAI` client from `server/utils/gemini.ts` (`getGemini()`) — never construct a new client per call. The key is `GEMINI_API_KEY`, server-private via `runtimeConfig.geminiApiKey` (no `NUXT_` prefix — set it explicitly in `nuxt.config.ts`).

### Structured JSON Response

```typescript
import { getGemini } from "~/server/utils/gemini";

const ai = getGemini();

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: `Your prompt here`,
  config: {
    systemInstruction: "You are a job matching assistant. Return only valid JSON.",
    responseMimeType: "application/json",
    // Optional: pass a `responseSchema` (Type.OBJECT) to constrain the shape
    temperature: 0.3,
  },
});

const result = JSON.parse(response.text!);
```

Wrap `generateContent` in a small retry helper — `gemini-2.5-flash` throws transient `503 UNAVAILABLE` / `429` spikes under load (see `server/utils/extract-profile.ts` `generateWithRetry`).

**Temperature settings:**

- `0.3` — matching, scoring, extraction, research synthesis — deterministic results
- `0.7` — resume generation — natural variation

**Max tokens:**

- Job matching + scoring: `300`
- Company research synthesis: `800`
- Resume generation: `1000`
- Profile extraction from resume: `800`

**Rules:**

- Model string is always `'gemini-2.5-flash'` — never use other model names
- Always set `config.responseMimeType: 'application/json'` (optionally a `responseSchema`) for structured data
- Always parse `response.text` as string — JSON mode returns a JSON string
- Always validate parsed JSON before using — wrap in try/catch
- Match threshold is always `MATCH_THRESHOLD` from `lib/utils.ts` — never hardcode 70
- Company research synthesis must always return a complete dossier — never return empty even if browser research failed

---

## PostHog

**Check first:** Check AGENTS.md for an installed PostHog skill. If a PostHog MCP server is configured — use it. The skill/MCP will have the latest client and server patterns.

### Client Setup (Browser)

```typescript
// app/plugins/posthog.client.ts
import posthog from "posthog-js";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  posthog.init(config.public.posthogKey, {
    api_host: config.public.posthogHost,
    capture_pageview: false, // manual pageview tracking
  });
});

// Capture event client-side
posthog.capture("job_found", {
  userId,
  source: "search",
  matchScore: score,
});
```

### Server Setup

```typescript
// server/utils/posthog.ts
import { PostHog } from "posthog-node";

export const createPostHogServer = () => {
  const config = useRuntimeConfig();
  return new PostHog(config.public.posthogKey, {
    host: config.public.posthogHost,
    flushAt: 1, // send immediately
    flushInterval: 0, // no batching — Nitro request handlers are short-lived
  });
};

// Always use and shutdown in the same function
const posthog = createPostHogServer();
posthog.capture({
  distinctId: userId,
  event: "company_researched",
  properties: { userId, jobId, company },
});
await posthog.shutdown(); // required — ensures event is sent
```

**Rules:**

- Always call `await posthog.shutdown()` in server-side functions — events are lost without it
- `flushAt: 1` and `flushInterval: 0` always set on server client
- Event names must match exactly the list in `code-standards.md`
- Always include `userId` as a property on every server-side event
- Call `posthog.identify(userId)` after login on client side
- Call `posthog.reset()` on logout on client side

### Reading event data back (dashboard charts, feature 17)

`posthog-node` only **captures** — it has no query API. But you rarely need one here:
**every PostHog event in this project is derived from the `jobs` table** (`job_found` is
captured the moment a job row is inserted; `company_researched` when a dossier is written).
So the dashboard analytics charts derive their numbers from the **in-memory job list**
(`useJobs`, already loaded for the stats) rather than querying PostHog — no personal API
key, no server route, no extra round-trip. `app/composables/useDashboardAnalytics.ts` is a
pure `computed` over `jobs.value` (same client-side-derive pattern as `useDashboardStats`
and `useRecentActivity`). PostHog stays the **write/funnel** sink; the DB is the read model.

> If you ever genuinely need to read events PostHog holds that the DB does not, that's the
> Query API (a **personal** `phx_…` key against the **app** host `us.posthog.com`, not the
> public `phc_…` capture key / ingestion host) — but prefer the DB while the events mirror it.

---

## pdfmake

**Check first:** Check AGENTS.md for an installed pdfmake skill. PDF generation APIs can differ from general training knowledge.

### Resume PDF Generation

```typescript
import PdfPrinter from "pdfmake";

const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
  },
};

const printer = new PdfPrinter(fonts);

const docDefinition = {
  defaultStyle: { font: "Helvetica", fontSize: 10 },
  content: [
    { text: profile.fullName, fontSize: 14, bold: true, margin: [0, 0, 0, 4] },
    { text: profile.email, margin: [0, 0, 0, 10] },
  ],
};

// Generate buffer
const pdfDoc = printer.createPdfKitDocument(docDefinition);
const chunks: Buffer[] = [];
pdfDoc.on("data", (chunk) => chunks.push(chunk));
const buffer = await new Promise<Buffer>((resolve) => {
  pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
  pdfDoc.end();
});

// Upload directly to InsForge Storage
await insforge.storage
  .from('resumes')
  .upload(`${userId}/resume.pdf`, buffer, {
    contentType: 'application/pdf',
    upsert: true
  })
```

**Rules:**

- Server-side only — never import in client-side composables or components
- PDF generation only in `server/api/resume/` routes
- Generated buffer uploaded directly to InsForge Storage — never written to disk
- Always save public URL to DB after upload
- Keep `docDefinition` content declarative — build it from plain data, never from Vue components

---

## pdf-parse

**Check first:** Check AGENTS.md for an installed pdf-parse skill.

### Extract Text from Uploaded Resume

```typescript
import pdf from "pdf-parse";

// server/api/resume/extract.post.ts
export default defineEventHandler(async (event) => {
  const formData = await readFormData(event);
  const file = formData.get("resume") as File;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const pdfData = await pdf(buffer);
  const extractedText = pdfData.text; // raw text content

  // Send to Gemini 2.5 for structured extraction
});
```

**Rules:**

- Server-side only — never import in client components
- `pdfData.text` is raw unformatted text — Gemini 2.5 handles the structure extraction
- Always handle parse errors — some PDFs are image-based and return empty text
- If `pdfData.text` is empty or very short — return error to user: "Could not extract text from this PDF. Please try a different file."
