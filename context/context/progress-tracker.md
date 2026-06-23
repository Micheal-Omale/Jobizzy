# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 04 Database Schema
**Next:** 05 Profile Page — Full UI (Phase 2)

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

**04 Database Schema**

- **Schema applied via the InsForge `run-raw-sql` MCP tool** (no migration-file mechanism exists). Four `public`-schema tables created exactly per `architecture.md`: `profiles` (24 cols), `agent_runs` (8), `jobs` (23), `agent_logs` (7). All verified: RLS enabled, 1 policy each, both triggers live, `resumes` bucket private.
- **RLS is real Postgres RLS keyed on `auth.uid()`.** InsForge ships Supabase-style helpers (`auth.uid()` uuid, `auth.role()`, `auth.jwt()`) and the standard `anon` / `authenticated` / `postgres` / `project_admin` roles. Each table has one `own_rows` policy `FOR ALL TO authenticated USING/WITH CHECK` — `profiles` on `id = auth.uid()`, the other three on `user_id = auth.uid()`. `SELECT/INSERT/UPDATE/DELETE` granted to `authenticated` only (no `anon` — all data is user-scoped). The server client carries the user JWT, so agent writes in Nitro routes are correctly scoped with **no service-role bypass**.
- **`auth.users.id` is `uuid`** (default `gen_random_uuid()`) — so `profiles.id uuid REFERENCES auth.users(id) ON DELETE CASCADE` is correct as written in `architecture.md`. `agent_runs`/`jobs`/`agent_logs.user_id` → `profiles(id) ON DELETE CASCADE`; `jobs.run_id` and `agent_logs.job_id` use `ON DELETE SET NULL`; `agent_logs.run_id` cascades.
- **Profiles auto-created on signup via a DB trigger.** `public.handle_new_user()` (SECURITY DEFINER, `search_path=public`) inserts `(id, email)` from `auth.users` `ON CONFLICT DO NOTHING`, fired by `trg_auth_user_created AFTER INSERT ON auth.users`. Every user always has a profile row — **feature 06 only UPDATEs, never inserts**. (The `auth.users` trigger created without ownership issues under the admin SQL role.)
- **Schema hardened beyond the bare column list:** CHECK constraints on `jobs.source ('search','url')`, `agent_runs.status`, `agent_logs.level`, and the profile enums (`experience_level`/`remote_preference`/`cover_letter_tone`/`work_authorization`) — all NULL-tolerant so the auto-created empty profile and partial saves stay valid. `jobs.match_score` CHECK `0–100` (nullable). `job_type` left as free text (Adzuna values vary — a CHECK would break agent inserts). Indexes on `user_id` / `run_id` / `found_at DESC` / `match_score DESC` (+ composite `jobs(user_id, found_at DESC)`) for the feature 11/15/16 filter/sort/stat queries. `trg_profiles_updated_at` (`public.set_updated_at()`) bumps `profiles.updated_at` on UPDATE.
- **Resumes bucket is private (`isPublic: false`), own-files enforced in app code** — the `create-bucket` MCP tool only exposes public/private, so isolation lives in the server route that always builds `resumes/{user_id}/resume.pdf` from the session user (never a client-supplied path). Storage-level RLS on `storage.objects` was deferred (InsForge honoring of it is unverified).
- **Row types written to `types/index.ts`** (root-level, per the `architecture.md` folder layout) — `Profile`, `AgentRun`, `Job`, `AgentLog` plus the enum unions and the `WorkExperienceEntry` / `Education` / `CompanyResearch` jsonb shapes. Single source of truth for table shapes; nullable DB columns typed as `T | null`. Import from the rootDir alias (`~~/types`), since Nuxt 4 srcDir is `app/` so `~`/`@` resolve to `app/`.

**03 PostHog Initialization**

- **Use the `@posthog/nuxt` module, not hand-rolled plugins.** The original plan called for `app/plugins/posthog.client.ts` (posthog-js) + `server/utils/posthog.ts` (posthog-node). The module supersedes both: its Vue plugin mounts the browser client and its Nitro plugin runs a posthog-node server client with automatic `shutdown()`. `code-standards.md` (deps list) and `build-plan.md` (feature 03) were updated to match.
- **Config lives under `posthogConfig` in `nuxt.config.ts`** — the module's `configKey` is `posthogConfig`, NOT `posthog`. Using the wrong key silently drops the token (PostHog inits without a key). `publicKey`/`host` are fed from `NUXT_PUBLIC_POSTHOG_KEY` / `NUXT_PUBLIC_POSTHOG_HOST`.
- **`app/composables/useAnalytics.ts` is the single tracking entry point** — typed `track`/`identify`/`reset` wrapping `usePostHog()`, SSR-safe via optional chaining. Its `AnalyticsEvent` union must stay in sync with the PostHog Events tables in `code-standards.md`.
- **identify/reset wired into `useAuth`** — `identify(user)` on session resolve in `refresh()`; `signed_out` event then `reset()` on sign-out.
- **Foundational events added** (registered in `code-standards.md`): `sign_in_started`, `sign_in_completed`, `sign_in_failed`, `signed_out`, `cta_clicked`. The four agent/funnel events (`job_search_started`, `job_found`, `profile_completed`, `company_researched`) remain unimplemented — blocked on their features (10, 06, 13).
- Pageviews, click autocapture, and unhandled-error capture are left ON (module defaults) — not fired manually.

**02 Auth**

- **InsForge package is `@insforge/sdk`, not `@insforge/ssr`.** The live MCP docs (which outrank the context files per `library-docs.md`'s order of authority) use `@insforge/sdk` with `createClient`. Browser auth goes through `app/composables/useInsforge.ts` (`createClient`). The server client for later DB features uses the `@insforge/sdk/ssr` subpath (`createServerClient`) — the `@insforge/ssr` import shown in `architecture.md` / `library-docs.md` / `code-standards.md` is superseded.
- **OAuth callback is SDK-handled.** `auth.getCurrentUser()` auto-completes the pending OAuth code exchange. `redirectTo` is `${origin}/auth/callback`; `app/pages/auth/callback.vue` just calls `refresh()` then redirects to `/dashboard` (or `/login?error=oauth`).
- **Scope is OAuth-only** (Google + GitHub). Email/password sign-up, email verification, and password reset exist in the SDK but are intentionally not wired.
- **Route protection is client-side.** `auth.global.ts` returns early on the server because the InsForge browser client resolves the session on the client; protected pages carry only auth-scoped content so there is no SSR leak.
- **Auth state** lives in `useState` (`auth:user`, `auth:loaded`) via `app/composables/useAuth.ts`; `ensureLoaded()` memoizes the first `getCurrentUser()` call so the middleware doesn't refetch per navigation.

---

## Notes

- **OAuth redirect URL / port gotcha (debugged 2026-06-23):** The InsForge backend validates the OAuth `redirect_uri` against its allowed redirect URLs. `http://localhost:3000/...` IS accepted out of the box (despite `get-backend-metadata` reporting `allowedRedirectUrls: []` — the backend default-allows localhost:3000). **Any other port is rejected** with `"<url> is not in the allowed redirect URLs"`. Symptom seen: leftover dev servers squatted on :3000, so `nuxt dev` drifted to **:3001**, and `signInWithOAuth` failed at init with a 400. Fix: **always run the dev server on port 3000** (kill stray node listeners on 3000–3002 first). For the deployed app (or any non-3000 dev port), add that exact callback URL to `allowedRedirectUrls` in the InsForge dashboard — no MCP tool sets this.
- The `refresh` 401 (`No refresh token provided`) on a logged-out page load is **expected** (no session yet); `useAuth.refresh()` now ignores 401 instead of logging it.
- Tailwind **v4** is retained (homepage was built on it); the InsForge instructions' "use Tailwind 3.4" note is intentionally not followed, consistent with feature 01.
- Env: `NUXT_PUBLIC_INSFORGE_URL` + `NUXT_PUBLIC_INSFORGE_ANON_KEY` in `.env` (gitignored) → `runtimeConfig.public.insforgeUrl` / `insforgeAnonKey`. `.env.example` committed with placeholders.
- Env: `NUXT_PUBLIC_POSTHOG_KEY` + `NUXT_PUBLIC_POSTHOG_HOST` in `.env` → fed into the `@posthog/nuxt` module via `posthogConfig.publicKey` / `posthogConfig.host` in `nuxt.config.ts` (the module's config key is `posthogConfig`, not `posthog`). The PostHog **personal** API key (for the PostHog MCP server in `.mcp.json`) is a separate secret — `.mcp.json` is now gitignored since it holds API keys.
- `app/pages/dashboard.vue` is a **placeholder stub** (greeting + sign-out button) so the post-login redirect doesn't 404. Replace with the real build in **feature 14** (Phase 5). It also currently hosts the only sign-out UI.
- **Placeholder stub pages** added so navbar/route navigation never 404s ahead of their real features: `app/pages/profile.vue` (feat 05), `app/pages/find-jobs/index.vue` (feat 09), `app/pages/find-jobs/[id].vue` (feat 12) — all render the shared `app/components/PagePlaceholder.vue` "coming soon" card. Replace each when its feature is built. These are stubs only; the features themselves are NOT done.
