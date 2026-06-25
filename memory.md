# Memory — Feature 10 (Adzuna Job Discovery) done + SSR auth foundation + jobs table wired to real data

Last updated: 2026-06-25

## What was built

**SSR server-auth foundation (the long-owed blocker) — done & verified by user (real Google/GitHub login works).** Migrated feature-02 auth from client-only `@insforge/sdk` `createClient` to the SSR cookie model so the server can act as the signed-in user.
- `app/composables/useInsforge.ts` → `createBrowserClient({ baseUrl, anonKey, refreshUrl:'/api/auth/refresh' })` from **`@insforge/sdk/ssr`**. Browser `auth` is now READ-ONLY (`getCurrentUser` only).
- `server/utils/insforge.ts` (new) — `createInsforgeServer(event)` (server client, `cookies:{ get }`), `createInsforgeAuthActions(event)`, and `h3CookieStore(event)` (read+write CookieStore adapter).
- `server/api/auth/` (new): `oauth-start.post.ts` (mints provider URL, stores PKCE `codeVerifier` in httpOnly `insforge_oauth_verifier` cookie), `oauth-callback.post.ts` (`exchangeOAuthCode` → sets auth cookies), `refresh.post.ts` (wraps `createRefreshAuthRouter()` via h3 `toWebRequest`/`sendWebResponse`), `signout.post.ts` (revoke + `clearAuthCookies`).
- `app/composables/useAuth.ts` — `signInWithOAuth`/`signOut` now `$fetch` the server routes; `refresh()` unchanged. `app/pages/auth/callback.vue` — reads `code` from URL, POSTs `/api/auth/oauth-callback`, then `refresh()`.

**Feature 10 — Adzuna Job Discovery — done, runs end-to-end (real Adzuna + Gemini + DB writes + PostHog).**
- `server/api/agent/find.post.ts` (new) — `POST /api/agent/find`: auth → load profile (`profiles` by `id=user.id`; 400 if no skills/title) → PostHog `job_search_started` → open `agent_runs` (`running`) → `searchJobs` → **per-job sequential scoring, throttled** → insert `jobs` + PostHog `job_found` → update run (`completed`, `jobs_found`=saved count) → returns `{ runId, count, strongMatches }`. Errors → run `failed`, 503 (transient) / 502.
- `lib/adzuna.ts` (new) — `searchJobs(jobTitle, location, appId, appKey, country?)` (keys passed in, `category=it-jobs`, `results_per_page=10`), `detectCountry`, `formatSalary`. `lib/utils.ts` (new) — `MATCH_THRESHOLD=70`, `formatRelativeTime`.
- `server/utils/score-job.ts` (new) — one Gemini call per job, mirrors `extract-profile.ts`. `server/utils/posthog.ts` (new) — `posthog-node` server client.
- `types/index.ts` — added `AdzunaJob`, `ScoredJob`. `nuxt.config.ts` — `adzunaAppId`/`adzunaAppKey` (private) + `public.posthogKey`/`posthogHost`. `posthog-node` added to deps.

**Jobs table wired to REAL data (mock removed; this is a slice of Feature 11).**
- `app/composables/useJobs.ts` (new) — shared `useState` job list + `refresh()` (reads `jobs` newest-first).
- `app/components/find-jobs/Table.vue` — renders real jobs, loading/empty states, real client-side pagination (20/page), rows click → `/find-jobs/{id}`.
- `app/components/find-jobs/SearchControls.vue` — `v-model` inputs, calls `/api/agent/find`, shows real `{count, strongMatches}` banner, then `refreshJobs()`. `app/pages/find-jobs/index.vue` — loads jobs on mount.

Trackers updated: `progress-tracker.md` (10 ✅ + full decisions/fixes), `ui-registry.md` (SearchControls + Table), and **`library-docs.md` InsForge/Adzuna sections corrected** to the real SSR API.

## Decisions made

- **SSR is the `@insforge/sdk/ssr` subpath — already installed, NO separate `@insforge/ssr` package.** Clients take an **options object** (`{ baseUrl, anonKey, ... }`). `createServerClient` wants `cookies:{ get }` (not getAll/setAll). Browser client auth is read-only; OAuth initiate + exchange + signout are server-side via `createAuthActions`. (library-docs.md was wrong on all three — now fixed. Verified against `node_modules/@insforge/sdk/dist/ssr.d.ts` + `SDK-REFERENCE.md`.)
- **OAuth redirect stays `${origin}/auth/callback`** — that path is on InsForge's allowlist; do NOT change it.
- **Scoring = one Gemini call per job (user chose over batching), throttled** `SCORE_DELAY_MS=2500` apart, each `scoreJob` wrapped so one failed/rate-limited job is skipped (non-fatal); `jobs_found`/banner = jobs actually saved.
- **DB accessor is `insforge.database.from(...)`** (server client too); inserts take an **object**. Scope: `user_id` for jobs/agent_runs, `id` for profiles.

## Problems solved

- **Adzuna 400 (AUTH_FAIL):** `.env` key var is **`ADZUNA_API_KEY`**, not `ADZUNA_APP_KEY` (build-plan's name). `nuxt.config.ts` reads `ADZUNA_API_KEY`. (runtimeConfig is read at startup — needs a dev RESTART, not just hot-reload.)
- **Gemini "Model returned invalid JSON":** `gemini-2.5-flash` is a THINKING model — reasoning tokens count against `maxOutputTokens`, so `300` truncated the JSON. Fixed in `score-job.ts`: `thinkingConfig:{ thinkingBudget:0 }` + `maxOutputTokens:1024`. (Apply this pattern to any future short-output 2.5-flash JSON call.)
- **Gemini 429 RESOURCE_EXHAUSTED:** free tier caps 2.5-flash at **20 req/min** (per-minute; `retryDelay ~6s`). 10 burst calls + repeated test searches exceeded it → throttling fix above. The route's generic 502 hides the real cause; Gemini's full 429 body (`generate_content_free_tier_requests, limit: 20`) is the diagnostic.
- **Stale node on :3000** makes dev fall back to 3001/3002 (OAuth only allows 3000) — kill the orphaned PID; Ctrl+C the dev server rather than closing the window to avoid orphaning it.

## Current state

- **Phase 1 ✅ (01–04). Phase 2 ✅ (05–08). Phase 3: 09 ✅, 10 ✅**, 11 partial (table reads real data; filters/sort NOT wired yet). `npm run typecheck` + `npm run build` clean.
- Live test passed: a search returns "Found N jobs and saved M strong matches" and the jobs appear in the table. User saw "Found 1 job" once — likely a narrow Adzuna query / strict `category=it-jobs` filter (try "Software Engineer" for more), or rate-limit skips if not waiting the full minute.

## Next session starts with

**Finish Feature 11 — wire `app/components/find-jobs/Filters.vue` (currently inert) to the real `useJobs()` data:**
- **Filter:** All Matches / High Match (`match_score >= MATCH_THRESHOLD`) / Low Match (`< MATCH_THRESHOLD`); plus the free-text "filter by company or role" input.
- **Sort:** Match Score (desc), Newest (`found_at` desc), Oldest (asc).
- These are inert `<select>`s today carrying the right option values. Lift filter/sort state into `useJobs` (or a shared `useState`) so `Filters` sets it and `Table` derives `pagedJobs` from filtered+sorted results (reset to page 1 on change). Pagination already real (20/page).
- Then update `progress-tracker.md`/`ui-registry.md` and check 11 done.

## Open questions

- The `Filters.vue` text-search + dropdowns need shared state with `Table.vue` — decide whether to extend `useJobs` with `filter`/`sort`/`query` refs (recommended) or add a separate composable.
- `app/pages/find-jobs/[id].vue` is still the `PagePlaceholder` stub (Feature 12); table rows already link to it.
- Gemini free-tier 20/min still bites if many searches run in a minute — throttling mitigates a single search; a paid tier or batching would remove it entirely if it becomes a problem.
- `@nuxt/fonts` (Inter) still not wired; `recharts` not yet an approved dep (Feature 17).
