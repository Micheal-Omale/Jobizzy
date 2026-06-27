# Memory — Brand rename: JobPilot → Jobizzy

Last updated: 2026-06-27

## What was built

Replaced leftover "JobPilot" branding with "Jobizzy" (brand name is "Jobizzy" everywhere per `DESIGN_BRIEF.md`). 6 replacements across 5 files:
- `app/pages/auth/callback.vue` — page title `'Signing you in… · Jobizzy'`
- `context/context/project-overview.md` — 2 sentences ("Jobizzy is a full stack…", "Jobizzy eliminates all of that…")
- `context/context/ui-tokens.md` — "Design tokens for Jobizzy."
- `context/context/ui-rules.md` — "Concise rules for building Jobizzy UI."
- `context/context/library-docs.md` — "…constraints specific to Jobizzy."

## Decisions made

- **Deliberately left the two `DESIGN_BRIEF.md` references (lines 9 and 170) untouched.** Those are meta-instructions *about* the rename ("leftover JobPilot copy — replace all of it with Jobizzy", "Rename all 'JobPilot' references to 'Jobizzy'"). Replacing the word there would make the sentences self-contradictory. User confirmed this scope ("App + docs, keep meta-instructions").
- `package.json` `"name"` was already `"Jobizzy"` — no code/build references needed changing.

## Current state

- All actual JobPilot branding is now Jobizzy. Grep for `job[\s_-]?pilot` (case-insensitive) returns only the two intentional `DESIGN_BRIEF.md` lines.
- Changes are uncommitted working-tree edits.

## Next session starts with

- Nothing pending on the rename. If broader rebrand is wanted, follow the rest of `DESIGN_BRIEF.md` (logo, full redesign).

## Open questions

- None for the rename.

---

# Memory — Vercel deploy fix: Stagehand was crashing the whole site

Last updated: 2026-06-27

## What was built

**Fix for a site-wide production 500 on Vercel.** Symptom: every route (`/`, `/favicon.ico`, `/favicon.png`, all of them) returned 500 with `Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@browserbasehq/stagehand' imported from /var/task/index.mjs`.

Changes made (committed as `accf10a`, NOT yet pushed):
- `server/utils/browserless.ts` — `createStagehand()` changed from a sync function with a **top-level** `import { Stagehand } from "@browserbasehq/stagehand"` to an **async** function that does `const { Stagehand } = await import("@browserbasehq/stagehand")` inside the body. Added an explanatory comment.
- `server/api/agent/research.post.ts` — its single call site (was line 73) now `await createStagehand()`.
- `.gitignore` — added `.vercel` (Vercel build output; was being committed by mistake).
- Untracked `.vercel/` from git (`git rm -r --cached .vercel`); files remain on disk.

Commit message deliberately has **no Co-Authored-By trailer** (user asked not to be credited as contributor).

## Decisions made

- **Root cause = a global-chunk crash, not just a missing dep.** `server/utils/*` is auto-imported by Nuxt into the global Nitro chunk (`nitro.mjs`) that boots on *every* request. A top-level Stagehand import there meant any bundling failure 500'd the entire site at module load — even static assets. Lazy `await import()` confines Stagehand to the company-research code path, so a bundling failure now only breaks that one endpoint, never the whole site. **Decoupling-first was chosen over a single bundling tweak** specifically to restore site availability independent of the still-unsolved bundling.
- **Vercel rebuilds from source — the committed `.vercel/output` was never deployed.** There is no `.vercel/project.json`, so the locally-built (Windows) `.vercel/output` was dead weight; it *had* Stagehand bundled, which is exactly why it worked locally but died on Vercel. Hence gitignoring/untracking it.

## Problems solved

- Verified the fix with a local `NITRO_PRESET=vercel npx nuxt build`: confirmed `index.mjs` no longer references stagehand at all, and `nitro.mjs`'s only reference is now `await import('@browserbasehq/stagehand')` *inside* `createStagehand()` (line ~4880) — i.e. not executed at boot. Site will no longer crash on load.
- A stray `npm add .` the user ran was confirmed harmless: package.json and package-lock.json had **zero** content changes (npm won't let a package depend on itself by the same name; it fell through to a plain install + `nuxt prepare` postinstall).

## Current state

- Commit `accf10a` is on `main`, **not pushed**. Pushing triggers a Vercel rebuild from source which should bring the site back up (home/auth/resume all work again).
- Only one caller of `createStagehand` exists: `server/api/agent/research.post.ts`.
- **Open risk:** the company-research endpoint may STILL fail on Vercel because Stagehand bundling is unsolved. Vercel was already dropping it as a *static* import, and dynamic `import()` is generally *less* likely to be traced by node-file-trace (same family as the earlier pdfmake trace gotcha). This is now contained to that one route, not the whole site.

## Next session starts with

1. **Push `accf10a`** (or have the user push) to deploy the site-recovery fix, then confirm home/favicon return 200.
2. **Fix company-research bundling on Vercel.** To do it right, get the Vercel **build** log (Dashboard → the deployment → Building section) — it shows whether Stagehand is externalized or trace-skipped, which decides the fix (Nitro `externals`/`serverExternals` config vs. another approach). The pdfmake precedent: a bare-name `nitro.externals.traceInclude` did NOT work; the working pdfmake fix was a static import of the package's real Node entry.

## Open questions

- Will Vercel bundle Stagehand for the research route at all now, or does it need explicit Nitro externals config? (Needs the build log.)
- Stagehand pulls a heavy tree (openai, playwright-ish deps; note the harmless zod v3/v4 peer-dep ERESOLVE warning). It drives a *remote* Chrome over CDP (`BROWSERLESS_WS_URL`), so Chromium itself need not be bundled — only the Stagehand JS.

---

# Memory — Dashboard chart hover tooltips

Last updated: 2026-06-27

## What was built

Added hover tracking (tooltips) to all three dashboard charts — they were previously static SVG/div renders with **no** interaction code at all (that was the whole "why aren't they tracking" answer: the feature was never built):

- `app/components/dashboard/JobsFoundChart.vue` (line chart) — wrapped the SVG in a `relative` div; added `@mousemove`/`@mouseleave`. `onMove` maps cursor screen-x into the 0→700 viewBox space and snaps to the **nearest** point. Active state draws a dashed vertical guide `<line>`, enlarges/recolors the active dot, and shows an HTML overlay tooltip positioned by `left: (point.x / 700) * 100%`. Also added `value` to the `points` computed (it only exposed x/y/label/isPeak before). Tooltip copy: `Thu — 8 jobs`.
- `app/components/dashboard/MatchScoreChart.vue` (bar chart) — per-bar `@mouseenter`/`@mouseleave` with `activeIndex` ref; hovering dims other bars (`opacity-70`) and pops a tooltip above. Added `value` to `bars`. Copy: `60-70% — 4 jobs`.
- `app/components/dashboard/CompanyResearchChart.vue` (bar chart) — same per-bar pattern. Copy: `Sat — 3 companies`.

## Decisions made

- **Line = nearest-point snapping via a single hit area; bars = per-bar hover.** Snapping feels continuous on a line (no dead zones); bars are discrete.
- **Tooltip is an HTML overlay `<div>`, not in-SVG `<foreignObject>`.** Reuses existing Tailwind tokens (`bg-surface`, `border-border`, `text-text`, `font-mono`) for a consistent card look and sidesteps SVG↔screen coordinate scaling. Line-chart tooltip positions by percentage so it stays aligned as the viewBox scales.
- Tooltip nouns: "jobs" (Jobs Found + Match Score), "companies" (Company Research).

## Current state

- All three charts track on hover. `nuxt typecheck` passed clean for the changed files. Not yet visually verified in a running dev server.
- Changes are uncommitted working-tree edits (separate from the unpushed Stagehand commit `accf10a` above).

## Next session starts with

- Run `npm run dev` and hover each chart to confirm feel — especially line-tooltip snapping near the chart edges.
- Optional: align the noun on Match Score if the bar value isn't actually "jobs" in a score band.

## Open questions

- Match Score bar value semantics — count of jobs in that band, or something else? Confirms the tooltip noun.
- No touch/mobile tooltip behavior (hover-only by design) — acceptable?
