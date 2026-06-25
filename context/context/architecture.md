# Architecture

## Stack

| Layer                          | Tool                       | Purpose                                          |
| ------------------------------ | --------------------------- | ------------------------------------------------- |
| Framework                      | Nuxt 4 (Vue 3, Composition API) | Full stack framework                         |
| Auth + DB + Storage + Realtime | InsForge                    | Entire backend                                   |
| Cloud browser                  | Browserless                 | Company research — browsing company public pages |
| AI browser control             | Stagehand                   | Company page interaction and content extraction  |
| Job Discovery                  | Adzuna API                  | Job search and discovery                         |
| AI model                       | Gemini 2.5 (`gemini-2.5-flash`) | Matching, research synthesis, extraction     |
| Analytics                      | PostHog                     | Event tracking and dashboard charts              |
| PDF generation                 | pdfmake                     | Resume PDF rendering                             |
| Styling                        | Tailwind CSS v4 + shadcn-vue | UI components and styling                        |
| Language                       | TypeScript strict           | Throughout                                       |

---

## Folder Structure

```
/
├── AGENTS.md
├── nuxt.config.ts
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── app/
│   ├── app.vue                              → Root component (PostHog client auto-mounts via the @posthog/nuxt module)
│   ├── assets/
│   │   └── css/
│   │       └── main.css                    → Tailwind import + design tokens
│   ├── pages/
│   │   ├── index.vue                       → Homepage
│   │   ├── login.vue                       → Login page
│   │   ├── auth/
│   │   │   └── callback.vue                → OAuth callback handler
│   │   ├── dashboard.vue                   → Main dashboard
│   │   ├── profile.vue                     → Profile form + resume management
│   │   └── find-jobs/
│   │       ├── index.vue                   → Find Jobs page — search controls + jobs list
│   │       └── [id].vue                    → Individual job details page
│   ├── layouts/
│   │   └── default.vue                     → Top navbar shell
│   ├── middleware/
│   │   └── auth.global.ts                  → Protects /dashboard, /profile, /find-jobs
│   ├── components/
│   │   ├── ui/                             → shadcn-vue components only
│   │   ├── layout/
│   │   │   ├── Navbar.vue
│   │   │   └── Footer.vue
│   │   ├── homepage/
│   │   │   ├── Hero.vue
│   │   │   ├── HowItWorks.vue
│   │   │   └── Features.vue
│   │   ├── dashboard/
│   │   │   ├── StatsBar.vue
│   │   │   ├── RecentActivity.vue
│   │   │   └── AnalyticsCharts.vue
│   │   ├── profile/
│   │   │   ├── ProfileForm.vue
│   │   │   ├── ResumeUpload.vue
│   │   │   ├── ResumePreview.vue
│   │   │   └── CompletionIndicator.vue
│   │   ├── find-jobs/
│   │   │   ├── SearchControls.vue
│   │   │   ├── JobsTable.vue
│   │   │   ├── JobFilters.vue
│   │   │   └── JobsPagination.vue
│   │   └── job-details/
│   │       ├── JobInfo.vue
│   │       ├── MatchScore.vue
│   │       ├── JobDescription.vue
│   │       ├── CompanyResearch.vue
│   │       └── JobActions.vue
│   └── composables/
│       ├── useInsforge.ts                  → Cached browser InsForge client
│       ├── useAuth.ts                      → Auth state + OAuth sign-in/out (fires identify/reset)
│       ├── useAnalytics.ts                 → Typed PostHog wrapper (track / identify / reset)
│       ├── useProfile.ts                   → Profile save + update calls
│       └── useJobs.ts                      → Job status reads/updates
├── server/
│   ├── api/
│   │   ├── agent/
│   │   │   ├── find.post.ts                → Trigger Adzuna job discovery
│   │   │   └── research.post.ts            → Trigger company research agent
│   │   └── resume/
│   │       ├── generate.post.ts            → Generate base resume PDF from profile
│   │       └── extract.post.ts             → Extract profile data from uploaded resume PDF
│   └── utils/
│       ├── insforge.ts                     → Server-side InsForge client (H3 event-bound)
│       ├── posthog.ts                      → PostHog server client (posthog-node; added with features 10/13 for server-side event capture)
│       └── browserless.ts                  → Browserless CDP connection helper
├── agent/
│   ├── adzuna.ts                           → Adzuna API job discovery + Gemini 2.5 scoring
│   ├── research.ts                         → Company research — Browserless + Stagehand + Gemini 2.5
│   ├── matcher.ts                          → Gemini 2.5 job matching logic
│   ├── extractor.ts                        → Gemini 2.5 job description extraction + structuring
│   └── types.ts                            → Agent-specific TypeScript types
├── lib/
│   ├── adzuna.ts                           → Adzuna API client
│   ├── stagehand.ts                        → Stagehand initialisation over Browserless CDP
│   └── utils.ts                            → Shared utility functions
└── types/
    └── index.ts                            → Global TypeScript types
```

---

## System Boundaries

| Folder        | Owns                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `app/pages`   | Routes only. No business logic — calls composables, renders components.                                |
| `server/api`  | Nitro route handlers only. No UI logic. Thin — validates input, calls `agent/` or `lib/`.               |
| `agent/`      | All agent logic. Adzuna discovery, company research, matching, extraction. Nothing here touches Vue.   |
| `app/composables` | Client-side data access — wraps `$fetch` calls to `server/api`. No direct DB calls.                |
| `app/components` | UI only. No data fetching logic. No direct DB calls — receive data via props or composables.       |
| `server/utils`| Third party client initialisation and shared server-only utilities.                                     |
| `types/`      | TypeScript types shared across the project.                                                              |

---

## Data Flow

### UI Mutations (Composable → Nitro API)

```
User interaction in component
        ↓
Composable in app/composables/ (calls $fetch)
        ↓
Nitro route handler in server/api/
        ↓
InsForge DB write
        ↓
Component refreshes data (useFetch refresh / navigateTo)
```

### Agent Operations (Nitro API Routes)

```
User clicks Find Jobs
        ↓
Nitro route — server/api/agent/find.post.ts
        ↓
Calls agent/adzuna.ts
        ↓
Adzuna API returns job listings
        ↓
Gemini 2.5 scores each job against user profile
        ↓
Agent writes results to InsForge DB
        ↓
Client refetches job list
```

### Company Research (Nitro API Routes)

```
User clicks Research Company on job details page
        ↓
Nitro route — server/api/agent/research.post.ts
        ↓
Calls agent/research.ts
        ↓
Single Browserless browser opens with Stagehand (over CDP)
        ↓
Navigates to company homepage + sub pages
        ↓
Gemini 2.5 synthesizes dossier from extracted content
        ↓
Dossier saved to jobs.company_research
        ↓
Client refetches job details
```

### Resume Operations (Nitro API Routes)

```
User uploads resume or clicks Generate
        ↓
Nitro route — server/api/resume/
        ↓
Gemini 2.5 processes content
        ↓
pdfmake renders PDF buffer
        ↓
New PDF uploaded to InsForge Storage
        ↓
URL saved to profiles table
```

---

## InsForge Database Schema

### `profiles`

| Column              | Type        | Notes                                        |
| ------------------- | ----------- | -------------------------------------------- |
| id                  | uuid        | References auth.users                        |
| full_name           | text        |                                              |
| email               | text        | Pre-filled from auth                         |
| phone               | text        |                                              |
| location            | text        | City, country                                |
| current_title       | text        | Most recent job title                        |
| experience_level    | text        | junior / mid / senior / lead                 |
| years_experience    | integer     |                                              |
| skills              | text[]      | Array of skill tags                          |
| industries          | text[]      | Industries worked in                         |
| work_experience     | jsonb       | Array of up to 3 roles                       |
| education           | jsonb       | Degree, field, institution, year             |
| job_titles_seeking  | text[]      | Roles they want                              |
| remote_preference   | text        | remote / onsite / hybrid / any               |
| preferred_locations | text[]      | Optional preferred locations                 |
| salary_expectation  | text        | Optional                                     |
| cover_letter_tone   | text        | formal / casual / enthusiastic               |
| linkedin_url        | text        |                                              |
| portfolio_url       | text        |                                              |
| work_authorization  | text        | citizen / permanent_resident / visa_required |
| resume_pdf_url      | text        | InsForge Storage URL of current resume       |
| is_complete         | boolean     | True when all required fields filled         |
| created_at          | timestamptz |                                              |
| updated_at          | timestamptz |                                              |

### `agent_runs`

| Column             | Type        | Notes                        |
| ------------------ | ----------- | ----------------------------- |
| id                 | uuid        |                              |
| user_id            | uuid        | References profiles          |
| status             | text        | running / completed / failed |
| job_title_searched | text        |                              |
| location_searched  | text        |                              |
| jobs_found         | integer     | Total jobs discovered        |
| started_at         | timestamptz |                              |
| completed_at       | timestamptz |                              |

### `jobs`

| Column             | Type        | Notes                                          |
| ------------------ | ----------- | ----------------------------------------------- |
| id                 | uuid        |                                                |
| run_id             | uuid        | References agent_runs — null if from URL input |
| user_id            | uuid        | References profiles                            |
| source             | text        | search / url                                   |
| source_url         | text        | Original job listing URL                       |
| external_apply_url | text        | Direct company apply URL                       |
| title              | text        |                                                |
| company            | text        |                                                |
| location           | text        |                                                |
| salary             | text        | If available                                   |
| job_type           | text        | fulltime / parttime / contract                 |
| about_role         | text        | 2-3 sentence summary                           |
| responsibilities   | text[]      | Bullet points                                  |
| requirements       | text[]      | Bullet points                                  |
| nice_to_have       | text[]      | Optional                                       |
| benefits           | text[]      | Optional                                       |
| about_company      | text        | Brief company description                      |
| match_score        | integer     | 0-100 scored against main profile              |
| match_reason       | text        | Gemini 2.5 explanation                             |
| matched_skills     | text[]      | Skills user has that match                     |
| missing_skills     | text[]      | Skills user lacks                              |
| company_research   | jsonb       | Company dossier from research agent            |
| found_at           | timestamptz |                                                |

### `agent_logs`

| Column     | Type        | Notes                            |
| ---------- | ----------- | --------------------------------- |
| id         | uuid        |                                  |
| run_id     | uuid        | References agent_runs            |
| user_id    | uuid        | References profiles              |
| message    | text        | Human readable log entry         |
| level      | text        | info / success / warning / error |
| job_id     | uuid        | Optional — related job           |
| created_at | timestamptz |                                  |

---

## InsForge Storage

| Bucket  | Path                         | Contents                  |
| ------- | ----------------------------- | -------------------------- |
| resumes | resumes/{user_id}/resume.pdf | Current active resume PDF |

Access: authenticated users only, own files only.

---

## Authentication

- Provider: InsForge Auth
- Methods: Google OAuth, GitHub OAuth
- Protected routes: /dashboard, /profile, /find-jobs, /find-jobs/[id]
- Public routes: /, /login
- Global route middleware in `app/middleware/auth.global.ts` checks session on every navigation, redirects unauthenticated users away from protected routes
- On login → redirect to /dashboard

---

## InsForge Client Pattern

Two separate InsForge instances — never mix them:

```typescript
// app/composables/useInsforge.ts
// Browser-side — used in components/composables for auth state
import { createBrowserClient } from "@insforge/ssr";

export const useInsforge = () => {
  const config = useRuntimeConfig();
  return createBrowserClient(
    config.public.insforgeUrl,
    config.public.insforgeAnonKey,
  );
};

// server/utils/insforge.ts
// Server-side — used in Nitro route handlers and agent code
import { createServerClient } from "@insforge/ssr";
import type { H3Event } from "h3";
import { getCookie, setCookie } from "h3";

export const createInsforgeServer = (event: H3Event) => {
  const config = useRuntimeConfig();
  return createServerClient(
    config.public.insforgeUrl,
    config.public.insforgeAnonKey,
    {
      cookies: {
        getAll: () =>
          Object.entries(parseCookies(event)).map(([name, value]) => ({
            name,
            value,
          })),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            setCookie(event, name, value, options),
          );
        },
      },
    },
  );
};
```

---

## Browserless Connection Pattern

```typescript
// Company research — connect Stagehand to a remote Chrome over CDP (Browserless).
// No separate session SDK call; the CDP URL is the whole connection.
const cdpUrl = `${process.env.BROWSERLESS_WS_URL}?token=${process.env.BROWSERLESS_API_KEY}`;
// The browser runs on Browserless cloud but is driven live from this Nitro handler —
// the handler stays alive for the full run (~120s). Run it as a background task.
```

---

## Job Discovery Pattern

**Adzuna API — job search**

```typescript
const response = await fetch(
  `https://api.adzuna.com/v1/api/jobs/us/search/1?` +
    `app_id=${process.env.ADZUNA_APP_ID}&` +
    `app_key=${process.env.ADZUNA_APP_KEY}&` +
    `what=${encodeURIComponent(jobTitle)}&` +
    `where=${encodeURIComponent(location)}&` +
    `category=it-jobs&` +
    `results_per_page=10&` +
    `content-type=application/json`,
);
const data = await response.json();
// data.results — array of job listings
// Each job: title, company.display_name, location.display_name,
//           salary_min, salary_max, description, redirect_url, created
```

---

## Company Research Pattern

```typescript
// Single browser — visits company homepage and sub pages sequentially
const stagehand = new Stagehand({
  env: "LOCAL", // connect to remote Chrome over CDP (Browserless)
  localBrowserLaunchOptions: {
    cdpUrl: `${process.env.BROWSERLESS_WS_URL}?token=${process.env.BROWSERLESS_API_KEY}`,
  },
  modelName: "google/gemini-2.5-flash",
  modelClientOptions: { apiKey: process.env.GEMINI_API_KEY! },
});

await stagehand.init();
const page = stagehand.page;

// Clean company name and construct homepage URL
const cleanName = companyName
  .replace(/\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|Co\.?).*$/i, "")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "");

const homepageUrl = `https://www.${cleanName}.com`;

// Navigate and extract — graceful fallback if page not found
try {
  await page.goto(homepageUrl);
  await page.waitForLoadState("networkidle");
  const content = await stagehand.extract({ instruction: "..." });
} catch (error) {
  // Log and continue — Gemini 2.5 will synthesize from what was found
  await logAgentError(jobId, error);
}

// Always close session when done
await stagehand.close();
```

---

## Invariants

Rules the AI agent must never violate:

- Nitro route handlers in `server/api/` contain no UI logic. Components contain no DB logic.
- Agent code in `/agent` never imports from `app/components` or `app/composables`.
- Composables never call agent functions directly. Agent functions are only called from Nitro route handlers.
- All InsForge server-side writes use `createInsforgeServer(event)` — never the browser client.
- No hardcoded hex values or raw Tailwind color classes in components — use CSS variables from ui-tokens.md.
- Every Stagehand action is wrapped in try/catch. Failures are logged to agent_logs, never thrown to crash the run.
- Company research always returns a dossier — even if browser research fails, Gemini 2.5 synthesizes from company name and job description alone. Never return empty.
- The Browserless browser is always closed with stagehand.close() when done — never leave a browser open.
- Always scope InsForge queries to the current user_id — never query without a user filter.
- Adzuna API always includes category=it-jobs — never search without this filter.
- jobs.source is always 'search' or 'url' — never any other value.
