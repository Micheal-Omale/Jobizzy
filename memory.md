# Memory — Phase 5 Dashboard: Features 14, 15, 16 done (UI + stats + recent activity wired to real data)

Last updated: 2026-06-26

## What was built

**Feature 14 — Dashboard Page (Full UI), built exactly to `designs/dashboard.png`.**
`app/pages/dashboard.vue` replaced its placeholder stub. Gray page shell (same as find-jobs: `min-h-[calc(100vh-5rem)] w-full bg-background px-6 py-8 md:px-8`, inner `mx-auto flex max-w-[1160px] flex-col gap-6`). Three rows: 4-up stat grid; a `lg:grid-cols-5` row (Recent Activity `col-span-2` + Company Research bar chart `col-span-3`); a `lg:grid-cols-2` row (Jobs Found line chart + Match Score bar chart). New components in `app/components/dashboard/` (tags `Dashboard*`): `StatCard.vue`, `StatsBar.vue`, `RecentActivity.vue`, `CompanyResearchChart.vue`, `JobsFoundChart.vue`, `MatchScoreChart.vue`.

**Feature 15 — Stats Bar real data.**
`app/composables/useDashboardStats.ts` (new) derives the 4 cards as a `computed` over `useJobs().jobs` (already loaded, RLS-scoped) — Total Jobs Found, Avg. Match Rate (rounded mean of non-null match_score), Companies Researched (company_research !== null), Jobs This Week (found_at < 7d). `StatCard.vue` gained `trendPositive` (green up / red down pill). `StatsBar.vue` consumes the composable + shows 4 `animate-pulse` skeleton cards while `!loaded`.

**Feature 16 — Recent Activity real data.**
`app/composables/useRecentActivity.ts` (new) merges completed `agent_runs` (own browser-client query) with `jobs.company_research` (from `useJobs`), sorts desc, caps at `ACTIVITY_LIMIT = 6`. Text: `"Found N jobs for {title}"` / `"Researched {company}"` + `formatRelativeTime`. `RecentActivity.vue` rewritten with skeleton/empty/list states; dots are 2-color (search→green, research→blue). `dashboard.vue` loads both on mount: `ensureLoaded()` → `Promise.all([refreshStats(), refreshActivity()])`.

Trackers updated each feature: `context/context/progress-tracker.md` (14/15/16 ✅ + full decisions) and `context/context/ui-registry.md` (Dashboard Page section).

## Decisions made

- **Charts are dependency-free inline SVG, NOT recharts.** recharts is React-only (can't render in Vue) and was never installed; the project convention is inline SVG (MatchScoreBar, all icons). Each chart = a `viewBox="0 0 100 100" preserveAspectRatio="none"` plot (gridlines + bars/area-line, `vector-effect="non-scaling-stroke"` for crisp strokes) with **HTML** axis labels rendered OUTSIDE the SVG (left `flex-col justify-between` y-column + bottom `flex` of `flex-1 text-center` x-labels) so label text never distorts. All colors via CSS-var tokens (`fill="var(--color-info/success)"`, `stroke="var(--color-accent)"`, gradient via `stop-color="var(--color-accent)" stop-opacity`). Feature 17 swaps the mock `data` arrays in each chart for real PostHog series — the render stays.
- **Design overrides stale build-plan labels:** 4th stat is **"Jobs This Week"** (not "Cover Letters Generated"); top-right chart is **"Company Research Activity"** (not "Resume Tailoring Activity"). The design's labels also match the 15/16/17 wiring spec.
- **Stats + activity derived client-side from the in-memory job list** (no new aggregate/server route) — same decision as the feature-11 filters; job counts are small. Only `agent_runs` needed a fresh query (feature 16).
- **Trend pills are REAL week-over-week (feature 15), not the feature-14 mock.** Leaving a hardcoded "+12%" on a real-data card would be dishonest. Total Jobs Found = % change of this-week vs prior-week counts; Avg. Match Rate = point change of this-week vs prior-week avg score. **Pill hidden when prior week has no jobs** (note falls back to "All time" / "Across all jobs"). Negative → red (`bg-error-lightest text-error`), positive → green.
- **Recent Activity dots = 2 colors per the feature-16 spec** (search→green = "job found", research→info blue), dropping feature-14's 3-color accent mock. `jobs.company_research` has no timestamp column, so research entries rank by `found_at` (only timestamp available).

## Problems solved

- **`formatRelativeTime(iso: string)` requires a non-null string** (`lib/utils.ts`, explicitly imported — NOT auto-imported). agent_run time uses `completed_at ?? started_at` (started_at is non-null).
- **SSR verification approach:** the built `.output` server can't run standalone in this env — a nitro/Node-24 `createRequire('file:///_entry.js')` incompatibility (from feature 08's pdfmake require, unrelated to dashboard work). Verify via `npm run dev` instead. Dashboard is auth-guarded client-side, so SSR renders skeletons and a headless screenshot redirects to /login after hydration — real figures aren't headlessly testable (OAuth).

## Current state

- **Phases 1–4 ✅ (features 01–13). Phase 5: 14 ✅, 15 ✅, 16 ✅, 17 NOT started.** `npm run typecheck` + `npm run build` clean. `/dashboard` SSRs 200 with skeletons + all 3 chart cards; stats/activity hydrate client-side after auth.
- **⚠️ Sign-out regression (open):** the old dashboard stub hosted the app's ONLY sign-out UI. The real dashboard (per design) has none, so there is currently **no way to sign out from the UI**. Needs a new home (Navbar user menu or Profile page) — flagged in progress-tracker + ui-registry. NOT yet fixed.

## Next session starts with

**Feature 17 — Analytics Charts (PostHog data)** — wire the three mock charts to real PostHog events for the current user:
- **Jobs Found Over Time** ← `job_found` events, last 30 days, grouped by day.
- **Match Score Distribution** ← `job_found` events, `matchScore` property bucketed 50-60/60-70/70-80/80-90/90-100.
- **Company Research Activity** ← `company_researched` events, last 7 days, grouped by day.
- Replace the mock `data` arrays in `CompanyResearchChart.vue` / `JobsFoundChart.vue` / `MatchScoreChart.vue`. Add an **empty state per chart** when no data. This is a NEW integration: server-side PostHog **query** reads (HogQL/query API) keyed on `distinctId = userId`, NOT the `posthog-node` capture client already in `server/utils/posthog.ts`. Likely a Nitro route (e.g. `server/api/dashboard/analytics.get.ts`) since it needs the PostHog **personal/project API key** (server-only secret) — distinct from the public posthogKey. Confirm which PostHog credentials/host are available before building.

## Open questions

- **PostHog query auth:** feature 17 needs read/query access (personal API key + project id), which is separate from the public capture key in `runtimeConfig.public.posthog`. Is a PostHog personal API key available as a server env var, or should the charts read from the InsForge DB instead (jobs.match_score for the distribution, agent_runs/found_at for over-time, company_research for research activity)? DB-derived would avoid a new PostHog dependency and match the 15/16 client-side pattern — worth proposing as the simpler path.
- **Sign-out** still needs a home (see Current state). Quick follow-up: add it to the Navbar.
- `@nuxt/fonts` (Inter) still not wired; charts use mock data until 17.
- `memory.md` should be re-saved after feature 17.
