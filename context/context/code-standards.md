# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — wrap agent operations in try/catch, log failures, never let one failure crash everything

---

## TypeScript

- Strict mode enabled in tsconfig.json — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- All async functions must have proper error handling — never let promises float unhandled
- Use `const` by default — only use `let` when reassignment is necessary

---

## Nuxt 4 / Vue 3 Conventions

- Composition API only — no Options API, no class components
- `<script setup lang="ts">` in every component — no exceptions
- File-based routing — pages live in `app/pages/`, never registered manually
- Components are auto-imported from `app/components/` — never manually import a component that lives there
- Composables are auto-imported from `app/composables/` — prefix every composable with `use`
- Data fetching in pages/components uses `useFetch` / `useAsyncData` — never raw `fetch` in `<script setup>` top level
- Nitro server routes live in `server/api/` — file name encodes the HTTP method (`find.post.ts`, `extract.get.ts`)
- Server-only logic never imports from `app/components` or `app/composables`
- Use `definePageMeta` for per-page middleware, layout, or auth requirements
- Never use `ref`/`reactive` for values that don't change — use `computed` or plain constants
- Always read Nuxt documentation before implementing any Nuxt-specific feature — APIs may differ from training data

---

## File and Folder Naming

- Folders: kebab-case — `job-details`, `agent-controls`
- Component files: PascalCase — `StatsBar.vue`, `RecentActivity.vue`
- Page files: kebab-case matching the route, dynamic segments in brackets — `find-jobs/[id].vue`
- Composable files: camelCase, prefixed `use` — `useProfile.ts`, `useJobs.ts`
- Utility files: camelCase — `browserbase.ts`, `posthog.ts`
- Type files: camelCase — `index.ts`
- Nitro route files: always `<name>.<method>.ts` — `find.post.ts`, `generate.post.ts`
- One component per file — never export multiple components from one `.vue` file
- Index files only in `components/ui/` — never barrel export from other folders

---

## Component Structure

Every component follows this exact order:

```vue
<script setup lang="ts">
// 1. External imports
import { ref, computed } from "vue";

// 2. Internal imports
import { useJobs } from "@/composables/useJobs";

// 3. Props and emits
type Props = {
  jobId: string;
  matchScore: number;
};

const props = defineProps<Props>();
const emit = defineEmits<{ refresh: [] }>();

// 4. State
const isLoading = ref(false);

// 5. Derived values
const scoreLabel = computed(() => `${props.matchScore}%`);

// 6. Handlers
function handleClick() {
  emit("refresh");
}
</script>

<template>
  <div>{{ scoreLabel }}</div>
</template>
```

- Props type defined directly above `defineProps` — not in a separate types file unless shared
- No inline styles — all styling via Tailwind classes using CSS variables from ui-tokens.md
- `<template>` always below `<script setup>` — never above

---

## Nitro API Route Handlers

```typescript
// server/api/agent/find.post.ts

import { createInsforgeServer } from "~/server/utils/insforge";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    // validate body
    // call agent function
    return { success: true, data: result };
  } catch (error) {
    console.error("[agent/find]", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
```

- Every route handler has a try/catch
- Every route handler validates the request body before processing
- Errors are logged with the route path as prefix: `[agent/find]`
- Success responses always return `{ success: boolean, data?: T }`
- Failures throw via `createError` — never return a 200 with an error payload

---

## Composables (Client-Side Data Access)

```typescript
// app/composables/useProfile.ts

export function useProfile() {
  async function saveProfile(formData: ProfileFormData) {
    try {
      const data = await $fetch("/api/profile", {
        method: "POST",
        body: formData,
      });
      return { success: true, data };
    } catch (error) {
      console.error("[composables/useProfile]", error);
      return { success: false, error: "Failed to save profile" };
    }
  }

  return { saveProfile };
}
```

- Every composable function that performs a mutation has a try/catch
- Every mutation composable returns `{ success: boolean, error?: string }`
- Never throw from a composable mutation — always return the error so the component can render it
- Composables never contain DB logic — they only call `server/api/` via `$fetch`

---

## Agent Code

```typescript
// agent/adzuna.ts

export async function discoverJobs(
  jobTitle: string,
  location: string,
  profile: Profile,
  runId: string,
): Promise<{ success: boolean; jobs?: Job[]; error?: string }> {
  try {
    // implementation
    return { success: true, jobs };
  } catch (error) {
    await logAgentError(runId, null, error);
    return { success: false, error: String(error) };
  }
}
```

- Every agent function returns `{ success: boolean, error?: string }`
- Every agent function has a try/catch — never let one failure crash the run
- Errors are always logged to agent_logs table before returning
- Agent functions never import from `app/components/` or `app/composables/`
- Agent functions never use Vue reactivity APIs or browser APIs

---

## InsForge Client Usage

```typescript
// Browser context — Client Components only
import { useInsforge } from "@/composables/useInsforge";
const insforge = useInsforge();

// Server context — Nitro route handlers, Agent
import { createInsforgeServer } from "~/server/utils/insforge";
export default defineEventHandler(async (event) => {
  const insforge = createInsforgeServer(event);
});
```

- Never use the browser client in server context
- Never use the server client in browser context
- Always pass the H3 `event` into `createInsforgeServer(event)` — it reads cookies from the request
- Always scope every query to the current user_id — never query without a user filter

---

## Error Handling

- Never use empty catch blocks — always log or handle
- Console errors always include context prefix: `[component/function name]`
- User-facing errors must be human readable — never expose raw error messages
- Agent errors go to agent_logs table — never surface raw agent errors to the UI
- Nitro route errors thrown via `createError` use a generic statusMessage — never expose internals

---

## PostHog Events

All PostHog events must use these exact event names. Never invent new event names without adding them to one of the tables below first.

Events are captured client-side through the `useAnalytics()` composable (`app/composables/useAnalytics.ts`), which wraps the `@posthog/nuxt` client. The `AnalyticsEvent` union in that composable is the single source of truth for event names in code and must always match these tables.

### Product funnel events

Tied to the job-search agent flow. These power the dashboard analytics charts (feature 17) and fire only once their owning features are built.

| Event                | When                                       | Key Properties             |
| --------------------- | ------------------------------------------- | --------------------------- |
| `job_search_started` | Find Jobs button clicked                   | userId, jobTitle, location |
| `job_found`           | Each job discovered and saved              | userId, source, matchScore |
| `profile_completed`  | User saves complete profile for first time | userId                      |
| `company_researched` | Company research dossier generated         | userId, jobId, company      |

`job_found` powers the Jobs Found Over Time and Match Score Distribution dashboard charts.
`company_researched` powers the Company Research Activity dashboard chart.
Always fire these with correct properties.

### Foundational events

Authentication and homepage engagement, captured from Phase 1 onward (features 01–03). Pageviews, click autocapture, and unhandled-error capture are handled automatically by `@posthog/nuxt` — do not fire those by hand.

| Event               | When                                                            | Key Properties              |
| -------------------- | --------------------------------------------------------------- | ---------------------------- |
| `sign_in_started`   | An OAuth provider button is clicked on `/login`                 | provider (`google`/`github`) |
| `sign_in_completed` | OAuth callback resolves an authenticated session                | —                            |
| `sign_in_failed`    | OAuth init fails on `/login`, or the callback resolves no session | provider (optional), reason |
| `signed_out`        | User signs out (fired before `reset()` so it keeps their identity) | —                          |
| `cta_clicked`       | A primary marketing CTA is clicked (Hero, BottomCta, Navbar)    | location, label, target      |

### Identity

- `posthog.identify(userId, { email, name, providers })` is called from `useAuth.refresh()` as soon as a session resolves — never fire user events before identity is set.
- `posthog.reset()` is called on sign-out, after the `signed_out` event, so the identity does not leak into the next session on the device.

---

## Environment Variables

All environment variables defined in `.env` for development. Never hardcode any key, URL, or secret anywhere in the codebase. Public variables go under `runtimeConfig.public` in `nuxt.config.ts`; secrets stay server-only.

| Variable                 | Exposed As                                  | Used In               |
| ------------------------- | -------------------------------------------- | ----------------------- |
| `NUXT_PUBLIC_INSFORGE_URL`      | `runtimeConfig.public.insforgeUrl`      | composables/useInsforge.ts |
| `NUXT_PUBLIC_INSFORGE_ANON_KEY` | `runtimeConfig.public.insforgeAnonKey`  | composables/useInsforge.ts |
| `BROWSERBASE_API_KEY`           | `runtimeConfig.browserbaseApiKey`       | server/utils/browserbase.ts |
| `BROWSERBASE_PROJECT_ID`        | `runtimeConfig.browserbaseProjectId`    | server/utils/browserbase.ts |
| `OPENAI_API_KEY`                | `runtimeConfig.openaiApiKey`            | agent/ functions        |
| `ADZUNA_APP_ID`                 | `runtimeConfig.adzunaAppId`             | lib/adzuna.ts            |
| `ADZUNA_APP_KEY`                | `runtimeConfig.adzunaAppKey`            | lib/adzuna.ts            |
| `NUXT_PUBLIC_POSTHOG_KEY`       | `posthogConfig.publicKey` → `runtimeConfig.public.posthog.publicKey` | nuxt.config.ts (`@posthog/nuxt`) |
| `NUXT_PUBLIC_POSTHOG_HOST`      | `posthogConfig.host` → `runtimeConfig.public.posthog.host`           | nuxt.config.ts (`@posthog/nuxt`) |

`NUXT_PUBLIC_` prefix (mapped to `runtimeConfig.public`) means the variable is exposed to the browser. Never put a secret key under `runtimeConfig.public`.

---

## Match Threshold

The job match threshold is defined once as a constant. Never hardcode this value anywhere else.

```typescript
// lib/utils.ts
export const MATCH_THRESHOLD = 70;
```

Import and use `MATCH_THRESHOLD` everywhere this value is needed.

---

## Import Aliases

Always use the `@/` alias (resolves to `app/`) — never use relative imports that go up more than one level.

```typescript
// Correct
import { useJobs } from "@/composables/useJobs";
import { MATCH_THRESHOLD } from "@/lib/utils";

// Never
import { useJobs } from "../../../composables/useJobs";
```

Server-side code uses the `~/` alias (resolves to project root) for `server/` and `agent/` imports.

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious decision
- Agent functions may have a brief comment explaining the Browserbase or Stagehand strategy
- Never leave TODO comments in committed code

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does shadcn-vue already have this component?
2. Does Nuxt already provide this functionality (a core feature or official module)?
3. Is there a simpler native solution?

Approved dependencies for this project:

- `@insforge/sdk` — InsForge client (browser: `createClient`; server: `@insforge/sdk/ssr` `createServerClient`). NOTE: earlier drafts and the patterns in `architecture.md` / `library-docs.md` reference `@insforge/ssr` — that package name is wrong; the real package is `@insforge/sdk`, confirmed against the live InsForge MCP docs.
- `@browserbasehq/sdk` — Browserbase sessions
- `@browserbasehq/stagehand` — AI browser control
- `openai` — GPT-4o API
- `@posthog/nuxt` — official PostHog Nuxt module. Provides the browser client (bundles `posthog-js`, mounted via its Vue plugin) and a Nitro server plugin (bundles `posthog-node`, with automatic `shutdown()` on close). Chosen over hand-rolling separate `posthog-js` + `posthog-node` plugins — it covers both the client and server integration that feature 03 requires. Access the client in code via the module's auto-imported `usePostHog()` composable, wrapped by `useAnalytics()`.
- `pdfmake` — Resume PDF generation
- `pdf-parse` — Extract text from uploaded PDF
- `zod` — Schema validation
- `lucide-vue-next` — Icons
- `tailwindcss` + `@tailwindcss/vite` — Styling
- `shadcn-vue` components — UI primitives
- `radix-vue` — Headless UI primitives backing shadcn-vue

Do not install any other packages without updating this list first.
