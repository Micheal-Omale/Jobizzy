# Memory — Feature 04: Database Schema

Last updated: 2026-06-23

## What was built

Feature 04 — Database Schema, complete and verified (applied live to InsForge, `npm run typecheck` clean). Phase 1 (Foundation) is now fully done; next is Phase 2.

Applied via the InsForge **`run-raw-sql`** MCP tool (no migration-file mechanism exists). Four `public`-schema tables, exactly per `context/context/architecture.md`, all verified (RLS on, 1 policy each, both triggers live):

- `profiles` — 24 cols. `id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` (1:1 with the auth user).
- `agent_runs` — 8 cols. `user_id → profiles(id) ON DELETE CASCADE`.
- `jobs` — 23 cols. `user_id → profiles(id) CASCADE`; `run_id → agent_runs(id) ON DELETE SET NULL`.
- `agent_logs` — 7 cols. `run_id → agent_runs(id) CASCADE`; `user_id → profiles(id) CASCADE`; `job_id → jobs(id) SET NULL`.

Plus:
- `resumes` storage bucket — **private** (`isPublic: false`), created via the `create-bucket` MCP tool, confirmed via `list-buckets`.
- Trigger `trg_auth_user_created AFTER INSERT ON auth.users` → `public.handle_new_user()` (SECURITY DEFINER, `search_path=public`) inserts `(id, email)` into `profiles` `ON CONFLICT DO NOTHING`.
- Trigger `trg_profiles_updated_at` → `public.set_updated_at()` bumps `profiles.updated_at` on UPDATE.
- Hardening: CHECK on `jobs.source ('search','url')`, `agent_runs.status`, `agent_logs.level`, the 4 profile enums (all NULL-tolerant), `jobs.match_score 0–100` (nullable); indexes on `user_id` / `run_id` / `found_at DESC` / `match_score DESC` + composite `jobs(user_id, found_at DESC)`.
- `GRANT SELECT/INSERT/UPDATE/DELETE` on all four tables to the `authenticated` role only (no `anon`).

Code/docs:
- `types/index.ts` — **new** (root-level, per the architecture.md folder layout). `Profile` / `AgentRun` / `Job` / `AgentLog` row types + enum unions (`ExperienceLevel`, `RemotePreference`, `CoverLetterTone`, `WorkAuthorization`, `AgentRunStatus`, `AgentLogLevel`, `JobSource`) + jsonb shapes (`WorkExperienceEntry`, `Education`, `CompanyResearch`). Nullable DB columns typed `T | null`. Source of truth for table shapes.
- `context/context/progress-tracker.md` — Feature 04 ticked, all build decisions recorded.

## Decisions made

- **RLS is real Postgres RLS keyed on `auth.uid()`.** InsForge ships Supabase-style helpers (`auth.uid()` returns uuid, `auth.role()`, `auth.jwt()`) and the standard `anon` / `authenticated` / `postgres` / `project_admin` roles. Each table has one `own_rows` policy `FOR ALL TO authenticated USING/WITH CHECK` — `profiles` on `id = auth.uid()`, the other three on `user_id = auth.uid()`. The server client carries the user JWT, so agent writes in Nitro routes are correctly scoped — **no service-role bypass** anywhere.
- **`auth.users.id` is `uuid`** (default `gen_random_uuid()`) — confirmed by inspecting the live schema. So architecture.md's `profiles.id uuid → auth.users` is correct as written (the SDK docs' `usr_abc123` ids are just doc placeholders).
- **Profiles auto-created on signup (DB trigger), not lazily.** Every user always has a profile row → **feature 06 only UPDATEs profiles, never inserts.**
- **Schema hardened** (CHECK constraints + FKs + indexes), but `job_type` left as free text — Adzuna's values vary and a CHECK would break agent inserts in feature 10. Enum CHECKs are NULL-tolerant so the auto-created empty profile and partial saves stay valid.
- **Resumes bucket own-files isolation lives in app code**, not the bucket config — the `create-bucket` MCP tool only exposes public/private. The server route must always build `resumes/{user_id}/resume.pdf` from the session user, never a client-supplied path. Storage-level RLS on `storage.objects` was deferred (InsForge honoring of it is unverified).

## Problems solved

- **How InsForge does access control** — it's Postgres + PostgREST with Supabase-style `auth.uid()` + `authenticated`/`anon` roles, so standard RLS policies work. (No proprietary permission system to learn.) The `auth.users` trigger created fine under the admin SQL role — no ownership block.

## Current state

- All four tables + bucket live and verified on the InsForge backend; `npm run typecheck` clean.
- `progress-tracker.md`: Phase 1 — 01 ✅, 02 ✅, 03 ✅, 04 ✅. **Phase 1 complete.** Next: 05 Profile Page (Phase 2).
- DB currently has zero user rows (clean). Profiles will populate automatically as users sign in (via the trigger).

## Next session starts with

Feature 05 — Profile Page Full UI (Phase 2), per `context/context/build-plan.md`. Build the complete profile page UI **with mock data, no save logic yet** (save is feature 06). This is the first consumer of the `types/index.ts` types. UI scope: completion banner + ring, resume upload area, and the Profile Information form (Personal / Professional / Work Experience up to 3 roles / Education / Job Preferences) + Save button. Use `/architect` first (it's a complex feature). Follow `ui-tokens.md` / `ui-rules.md`, register new components in `ui-registry.md`.

## Open questions

- **Import alias for `types/`:** root-level `types/` is outside Nuxt's `app/` srcDir, so `~`/`@` resolve to `app/`. Import the types via the **rootDir alias** — `import type { Profile } from "~~/types"`. Verify this resolves when first used in feature 05.
- **Verify the signup trigger end-to-end** — sign in with a fresh OAuth account and confirm a `profiles` row appears with id + email. (Couldn't test without a real new signup this session.)
- Still carried from feature 03: verify PostHog events land once the MCP personal key is set + Claude restarted; `@nuxt/fonts` (Inter) not wired; `recharts` not in approved deps (needed feature 17); only the secondary button variant exists (capture primary in `ui-registry.md` on first use).
- Context files (`architecture.md`, `library-docs.md`) still show the wrong `@insforge/ssr` import inline — the real package is `@insforge/sdk` (server client: `createServerClient` from `@insforge/sdk/ssr`). Fix the server-client pattern when building feature 06.

## Durable project gotchas (carried forward)

- **OAuth redirect URL / port:** InsForge allows `http://localhost:3000/auth/callback` (now confirmed in `allowedRedirectUrls`); **any other port is rejected** with `"<url> is not in the allowed redirect URLs"`. Always run dev on **port 3000** (kill stray node listeners on 3000–3002 first; `PORT=3000 NUXT_IGNORE_LOCK=1` if a stale lock blocks). For prod / non-3000 ports, add the exact `…/auth/callback` URL in the InsForge dashboard — no MCP tool sets this.
- **`public/` and `context/` are double-nested on disk** — real files live at `public/public/...` and `context/context/...`. Static asset URLs are `/public/<path>` (e.g. `/public/logo.png`), NOT the usual Nuxt `/logo.png`. Do not "correct" these.
- `public/public/logo.png` is a 496×168 full wordmark (icon + "JobPilot" baked in) — render `w-auto`, never force square, never add a separate text span.
- **InsForge package is `@insforge/sdk`, not `@insforge/ssr`** — browser: `createClient`; server (DB features): `createServerClient` from `@insforge/sdk/ssr`. Live InsForge MCP docs outrank the context files.
- The `refresh` 401 (`No refresh token provided`) on a logged-out page load is **expected**; `useAuth.refresh()` ignores 401.
- Tailwind **v4** is retained intentionally (the InsForge "use Tailwind 3.4" note is not followed).
- Visual verification: no `chromium-cli`, Playwright browsers not installed. System Chrome headless works: `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --hide-scrollbars --window-size=1440,5200 --screenshot=<abs.png> http://localhost:3000`.
- **DB access:** schema changes go through the InsForge `run-raw-sql` MCP tool (admin). RLS uses `auth.uid()`; always grant table privileges to the `authenticated` role and add a `user_id = auth.uid()` policy when creating any new user-scoped table.
