# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Layout Shell (`app/layouts/default.vue`)
- Classes: `min-h-screen flex flex-col bg-background text-text-primary font-sans`
- Content wrapper: `flex-1 w-full max-w-[1440px] mx-auto bg-surface`

### Navbar (`app/components/layout/Navbar.vue`)
- Container: `h-16 w-full bg-surface px-6 flex items-center justify-between border-b border-border`
- Links: `text-[14px] font-medium text-text-dark hover:text-text-primary`
- Active link: `text-accent`

### Hero (`app/components/homepage/Hero.vue`)
- Container: `relative w-full overflow-hidden pt-24 pb-16 flex flex-col items-center text-center`
- Headline: `text-5xl md:text-6xl font-bold tracking-tight text-text-primary max-w-3xl leading-tight`
- Subhead: `mt-6 text-[18px] text-text-secondary max-w-2xl mx-auto leading-relaxed`

### Features (`app/components/homepage/Features.vue`)
- Container: `py-24 w-full border-t border-border mt-12 bg-surface`
- Grid: `max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`
- Active item: `border-l-2 border-accent bg-accent-muted/30`
- Image card: `bg-surface-secondary rounded-2xl p-8 border border-border flex items-center justify-center`

### Testimonial (`app/components/homepage/Testimonial.vue`)
- Container: `py-24 border-t border-border bg-surface text-center flex flex-col items-center px-6`
- Quote: `text-3xl md:text-4xl font-medium text-text-primary leading-tight`
- Subtext: `text-[12px] font-bold text-accent uppercase tracking-widest mb-8 block`

### Bottom CTA (`app/components/homepage/BottomCta.vue`)
- Container: `relative py-24 border-t border-border overflow-hidden flex flex-col items-center text-center`
- Headline: `text-4xl md:text-5xl font-bold text-text-primary tracking-tight`

### Card

File: `app/pages/login.vue`, `app/pages/dashboard.vue`
Last updated: 2026-06-23

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border border-border`                                               |
| Border radius    | `rounded-2xl` (16px)                                                  |
| Text — heading   | `text-[24px] font-bold leading-8 text-text-primary` (standalone) / `text-[16px] font-semibold leading-6 text-text-primary` (section) |
| Text — secondary | `text-[14px] leading-5 text-text-secondary`                          |
| Spacing          | `p-8` for standalone auth cards, `p-6` for in-page content cards     |
| Hover state      | none                                                                  |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Accent usage     | none                                                                  |

**Pattern notes:**
Canonical card per ui-tokens — white surface, 16px radius, 1px `--border`, soft shadow. Never use colored card backgrounds; color goes inside via badges/text. The login card adds `max-w-md`.

### OAuth Provider Button

File: `app/pages/login.vue`
Last updated: 2026-06-23

| Property      | Class                                                  |
| ------------- | ------------------------------------------------------ |
| Background    | `bg-surface`                                           |
| Border        | `border border-border`                                 |
| Border radius | `rounded-md`                                           |
| Text          | `text-[14px] font-medium text-text-primary`            |
| Spacing       | `h-12 px-4 gap-3` (full width via `w-full`)            |
| Hover state   | `hover:bg-surface-secondary`                           |
| Disabled      | `disabled:cursor-not-allowed disabled:opacity-60`      |
| Shadow        | none                                                   |
| Accent usage  | none — brand glyph only                                |

**Pattern notes:**
Secondary-button styling, full-width, icon + label centered (`flex items-center justify-center`). Inline brand SVGs (Google multi-color, GitHub `currentColor`) are the **one allowed exception** to the no-hardcoded-color rule. Loading label swaps to "Redirecting…" and disables both buttons.

### Secondary Button (e.g. Sign out)

File: `app/pages/dashboard.vue`
Last updated: 2026-06-23

| Property      | Class                                             |
| ------------- | ------------------------------------------------- |
| Background    | `bg-surface`                                      |
| Border        | `border border-border`                            |
| Border radius | `rounded-md`                                      |
| Text          | `text-[14px] font-medium text-text-primary`       |
| Spacing       | `px-4 py-2`                                        |
| Hover state   | `hover:bg-surface-secondary`                      |
| Disabled      | `disabled:cursor-not-allowed disabled:opacity-60` |
| Accent usage  | none                                              |

**Pattern notes:**
Matches the ui-tokens "Secondary button". Same surface/border/hover as the OAuth button but standard `px-4 py-2` height (not `h-12`). The primary button (`bg-accent text-accent-foreground`) is not yet built — capture it on first use.

### Inline Error Banner

File: `app/pages/login.vue`
Last updated: 2026-06-23

| Property      | Class                              |
| ------------- | ---------------------------------- |
| Background    | none (transparent)                 |
| Border        | `border border-error`              |
| Border radius | `rounded-md`                       |
| Text          | `text-[13px] leading-5 text-error` |
| Spacing       | `px-4 py-3`                        |
| Accent usage  | `--error` token                    |

**Pattern notes:**
Always `role="alert"`. Human-readable copy only — never raw error/exception text (code-standards). Uses the solid `--error` token, no opacity tints.

### Loading Spinner

File: `app/pages/auth/callback.vue`
Last updated: 2026-06-23

| Property      | Class                                  |
| ------------- | -------------------------------------- |
| Border        | `border-2 border-border border-t-accent` |
| Border radius | `rounded-full`                         |
| Spacing       | `h-8 w-8`                              |
| Animation     | `animate-spin`                         |
| Accent usage  | `border-t-accent` (the moving arc)     |

**Pattern notes:**
Track is `border-border`; the spinning highlight is `border-t-accent`. Caption below uses `text-[14px] font-medium text-text-secondary`.

### Full-screen Auth Page Shell

File: `app/pages/login.vue`, `app/pages/auth/callback.vue`
Last updated: 2026-06-23

- `definePageMeta({ layout: false })` — opts out of the navbar/footer layout
- Centering: `flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12`

**Pattern notes:**
Auth/standalone pages center their content on `bg-background` (the page background) rather than `bg-surface`. The dashboard placeholder instead uses the homepage shell wrapper `min-h-[60vh] w-full border-x border-border bg-surface px-6 py-12 md:px-8`.

### Auth-aware CTAs (Navbar + Hero) — behavioral

File: `app/components/layout/Navbar.vue`, `app/components/homepage/Hero.vue`
Last updated: 2026-06-23

Navbar "Start for free" and both Hero CTAs bind `:to="ctaTarget"` from `useAuth()` → `/login` when logged out, `/dashboard` when authenticated. The Navbar button label also swaps to "Go to Dashboard" when authenticated. Visual classes unchanged from the original homepage build.

> **Note — `app/pages/dashboard.vue` is now the real dashboard (feature 14).** ⚠️ The old stub hosted the app's **only** sign-out UI; the real dashboard (built to the design) has no sign-out. Sign-out needs a new home (Navbar user menu or Profile page) — currently there is no way to sign out from the UI.

### PagePlaceholder (`app/components/PagePlaceholder.vue`)

File: `app/components/PagePlaceholder.vue`
Last updated: 2026-06-23

Reusable "coming soon" stub for routes whose real UI is built in a later phase. Props: `title`, `description`, `note?`.

| Property        | Class                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Page wrapper    | `min-h-[60vh] w-full border-x border-border bg-surface px-6 py-12 md:px-8` (homepage shell) |
| Inner width     | `mx-auto max-w-[1160px]`                                              |
| Title           | `text-[30px] font-semibold leading-9 text-text-primary`              |
| Card            | the canonical **Card** (`rounded-2xl border border-border bg-surface p-6` + shadow) |
| Card heading    | `text-[16px] font-semibold leading-6 text-text-primary`             |
| Description     | `text-[14px] leading-5 text-text-secondary`                          |
| Note            | `text-[12px] leading-4 text-text-muted`                              |

**Pattern notes:**
Used by the stub pages `app/pages/profile.vue` (feat 05 — **now replaced by the real page**), `app/pages/find-jobs/index.vue` (feat 09), `app/pages/find-jobs/[id].vue` (feat 12). Shares the same shell + Card as the dashboard stub. Delete usages as each real page is built.

---

## Profile Page (Feature 05)

`app/pages/profile.vue` replaces its PagePlaceholder stub. Page shell: `w-full border-x border-border bg-surface px-6 py-10 md:px-8`, inner column `mx-auto flex max-w-[880px] flex-col gap-6`. Composes `<ProfileCompletionIndicator>`, `<ProfileResumeUpload>`, `<ProfileForm>`. UI + mock data only — no save logic (feature 06). **Cover Letter Tone is intentionally omitted** — it is in the design's source of truth (`designs/profile.png`) as absent, and cover letters are out of scope per `project-overview.md`.

### Primary Button (now built)

Files: `app/components/profile/ProfileForm.vue` (Save Profile), `app/components/profile/ResumeUpload.vue` (Generate Resume from Profile)
Last updated: 2026-06-24

| Property      | Class                                                        |
| ------------- | ------------------------------------------------------------ |
| Background    | `bg-accent` → `hover:bg-accent-dark`                         |
| Text          | `text-accent-foreground` `text-[14px] font-medium`          |
| Border radius | `rounded-md`                                                |
| Spacing       | `px-4 py-3` (full-width Save) / `px-4 py-2.5` (inline)       |
| Icon          | optional leading 16px inline SVG (`h-4 w-4`, `currentColor`) |

**Pattern notes:**
The canonical accent primary button (ui-tokens "Primary"), previously unbuilt. Full-width variant adds `w-full`. Inline variant uses `inline-flex items-center justify-center gap-2`.

### Form Field — label + input/select/textarea

File: `app/components/profile/ProfileForm.vue`
Last updated: 2026-06-24

| Element       | Class                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label         | `mb-1.5 block text-[12px] font-medium uppercase tracking-wide text-text-secondary`                                                                   |
| Input         | `w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[14px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent` |
| Disabled input| (email, read-only) `bg-surface-secondary text-text-secondary cursor-not-allowed`                                                                     |
| Select        | input classes + `cursor-pointer appearance-none pr-9`, wrapped in `relative` with a `pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted` chevron SVG |
| Textarea      | input classes + `resize-y`, `rows="3"`                                                                                                               |
| Checkbox      | `h-4 w-4 rounded border-border accent-accent` (native `accent-color` tinted to the token)                                                            |
| Grid          | `grid grid-cols-1 gap-4 md:grid-cols-2`; full-width fields use a single-column wrapper                                                               |

**Pattern notes:**
Class strings are defined once in `<script setup>` (`inputClass`, `selectClass`, `labelClass`, `addButtonClass`) and bound via `:class` to avoid drift. Inputs are `py-2.5` (≈40px tall) — slightly taller than the ui-tokens `py-2` baseline, to match the design. Section titles: `text-[14px] font-semibold text-text-primary`; sections separated by `border-t border-border pt-6/pt-8`. Selects/enum options are sourced from the `~~/types` enum unions (first consumer of `types/index.ts`).

### Tag / Chip Input (skills, industries)

File: `app/components/profile/ProfileForm.vue`
Last updated: 2026-06-24

- Row: input (`flex-1`) + secondary **Add** button (`shrink-0 rounded-md border border-border bg-surface px-4 py-2.5 text-[14px] font-medium text-text-primary hover:bg-surface-secondary`). Enter key also adds.
- Chip: `inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-[12px] font-medium text-accent` with a trailing × button (`h-3 w-3` SVG, `hover:opacity-70`).

Add/remove are local state only (no persistence until feature 06).

### Work Experience role card

File: `app/components/profile/ProfileForm.vue`
Last updated: 2026-06-24

- Nested sub-card: `rounded-xl border border-border bg-surface-secondary p-4` (a card-inside-a-card — the one place a non-white nested surface is used, to group a repeatable role).
- Up to **3** roles; "Add role" accent text+plus link in the section header, hidden at the cap. "Remove role" muted text button shows only when `roles.length > 1` (so the default single-role view matches the design exactly).
- Dates are native `<input type="month">` (renders "January 2022"). "Currently working here" checkbox sits top-right of the End Date label row and disables the end-date input (`disabled:bg-surface-tertiary disabled:text-text-muted`).

### Profile Completion Banner (`app/components/profile/CompletionIndicator.vue`)

File: `app/components/profile/CompletionIndicator.vue`
Last updated: 2026-06-24

Props: `percentage: number`, `missingFields: string[]`.

| Property      | Class / value                                                                       |
| ------------- | ----------------------------------------------------------------------------------- |
| Card          | `rounded-2xl border border-error-light bg-error-lightest p-6` — **the one tinted (non-white) card**, a deliberate design-driven deviation from the "white cards only" rule for the attention state |
| Heading       | red alert-circle SVG (`text-error`) + `text-[16px] font-semibold text-text-primary` |
| Missing tags  | `rounded-full bg-error-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-error` |
| Ring          | 88px SVG, two `r=40 stroke-width=8` circles: track `stroke="var(--color-border-light)"`, progress `stroke="var(--color-error)"` with `stroke-linecap="round"`, `-rotate-90`; `stroke-dashoffset = C·(1 − pct/100)`. Center `text-[20px] font-bold text-error`. |

### Resume Upload card (`app/components/profile/ResumeUpload.vue`)

File: `app/components/profile/ResumeUpload.vue`
Last updated: 2026-06-24

- Canonical white **Card**. Dashed dropzone: `rounded-xl border border-dashed border-border-muted bg-surface-secondary px-6 py-10 text-center`, accent upload-cloud SVG (`h-8 w-8 text-accent`), helper text, secondary **Select Resume** button.
- Footer row (`border-t border-border pt-4`, `sm:flex-row sm:justify-between`): prompt text + primary **Generate Resume from Profile** button.
- Presentational only — upload/extract/generate wired in features 06/07/08.

### New tokens — error tints

Added `--color-error-light` (#fee2e2) and `--color-error-lightest` (#fef2f2) to `main.css` (`:root` + `@theme inline`) for the attention banner surface and missing-field tags. Generated utilities: `bg-error-light`, `bg-error-lightest`, `border-error-light`, `text-error-light`, etc.

### Consistency notes for future components (imprinted feat 05)

- **Form-control height baseline is now `py-2.5`** (≈40px) for inputs, selects, textareas, and inline Add buttons. The earlier `py-2` ui-tokens baseline is still used by the standalone secondary button + OAuth buttons (`h-12`). **The next form UI (feature 09 search controls) should use `py-2.5`** to match the profile form, not `py-2`. Pick one deliberately.
- **Profile skill/industry chips use `bg-accent-light text-accent`** — a richer lavender than the ui-tokens "Skills Badges → missing = `bg-accent-muted`" row. That token row governs the **job match badges** (feature 12), not these profile chips. When building matched/missing skill badges, use the token guide (`bg-success-lightest text-success-foreground` matched / `bg-accent-muted text-accent` missing) — do **not** copy the profile chip color.
- **Radius nesting:** the Work Experience field group is 3 rounded levels deep (card `rounded-2xl` → role sub-card `rounded-xl` → input `rounded-md`), one past the ui-rules "max 2 levels" guidance. Acceptable because the input reads as a control, not a nested container — but avoid adding a *fourth* rounded container inside a role.
- **The attention banner is the only card without the canonical shadow** (border-only, intentional for the flatter attention state). Every other card keeps `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]`.

### Profile save wiring (Feature 06)

The feature-05 components were wired to InsForge (client-side via `useProfile`). UI patterns added:

- **Resume dropzone (now functional, `ResumeUpload.vue`)** — the dashed area is a `<button>` that opens a hidden `<input type="file" accept="application/pdf">` and accepts drag-and-drop; dragging toggles `border-accent bg-accent-muted`. A staged file shows a `rounded-md border border-border bg-surface-secondary px-3 py-2` row with a truncated filename + "Remove" (`hover:text-error`). When no file is staged but one is saved, a `text-success` check row reads "A résumé is on file…" alongside a **"View résumé"** `text-accent` button (`getResumeObjectUrl()` → `storage.download` → blob URL → `window.open`, since the bucket is private). Client-side PDF/≤5MB guard surfaces a `text-[13px] text-error` message. Bound to the page via `v-model:file`. The Save button shows a distinct **"Uploading résumé…"** phase (vs "Saving…") while the slow S3 upload runs.
- **Form save feedback (`ProfileForm.vue`)** — the Save row (`mt-6 flex … sm:justify-end`) shows a `text-[13px] font-medium` status line with three states: success `text-success-foreground` (`role="status"`), error `text-error` (`role="alert"`), and **warning `text-warning`** (profile saved but the résumé upload failed/timed out — still `role="status"`). The Save button gains `disabled:cursor-not-allowed disabled:opacity-60`, label swaps to "Saving…", and is `w-full sm:w-auto` (full-width on mobile, inline on desktop) — a refinement of the feat-05 full-width-only button.
- **Page load skeleton (`profile.vue`)** — while the profile fetches (and as the `<ClientOnly>` fallback), two stacked `animate-pulse rounded-2xl border border-border bg-surface-secondary` blocks (`h-40` banner + `h-[760px]` form) stand in. Reusable pattern for client-fetched pages.
- **Empty select option** — every enum `<select>` now leads with `<option value="">Select…</option>`; a blank maps to `null` on save. New users see "Select…" rather than a forced first value.

### Résumé extraction (Feature 07)

Files: `app/components/profile/ResumeUpload.vue` (Extract button), `app/pages/profile.vue` (review notice)
Last updated: 2026-06-24

- **Extract from Resume button** — an **outline accent** button variant (new): `inline-flex w-full items-center justify-center gap-2 rounded-md border border-accent px-4 py-2.5 text-[14px] font-medium text-accent hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60` with a leading 16px sparkle SVG (same glyph as "Generate Resume from Profile"). Shown when a résumé is available (`file || resumeUrl`). Label swaps to **"Extracting…"** while the POST runs; errors reuse the card's existing `text-[13px] text-error` line. This is the **outline counterpart** to the canonical filled accent **Primary Button** — use it for secondary AI actions on a card that already has a filled primary.
- **Extract review notice (`profile.vue`)** — after extraction, a `role="status"` banner above the form: `rounded-md border border-accent bg-accent-light px-4 py-3 text-[13px] leading-5 text-accent` reading "Review the details pulled from your résumé below, then Save Profile." Distinct from the **red attention banner** (CompletionIndicator) — this accent-tinted strip is informational. Cleared on save.
- **Form remount pattern** — `<ProfileForm :key="formKey">` is remounted (key bump) to apply extracted data, since the form seeds its refs from `initialProfile` only at setup. Reusable wherever externally-supplied data must replace a form's in-memory state.

### Résumé generation (Feature 08)

Files: `app/components/profile/ResumeUpload.vue` (Generate button), `app/pages/profile.vue` (on-file row refresh)
Last updated: 2026-06-24

- **Generate Resume from Profile button** — the existing **filled accent Primary Button** in the card footer, now wired: `:disabled="generating"` with the canonical `disabled:cursor-not-allowed disabled:opacity-60`, label swaps to **"Generating…"** while the POST runs. Same sparkle glyph as the Extract button. Errors reuse the card's shared `text-[13px] text-error` line (including the min-field gate message). On success it opens the generated PDF in a new tab (blob, like View résumé) and emits `generated` with the new URL.
- **On-file row refresh (`profile.vue`)** — `handleGenerated(url)` patches `resume_pdf_url` onto both the saved `profile` and `formSeed` (spread, no other field touched), so the **"A résumé is on file"** row + **View résumé** action appear/update immediately without a re-fetch. Reusable pattern for any single-field, server-confirmed update to a client-held row.
- **Component now takes `:profile`** — `ResumeUpload` receives the last-saved `Profile` (the generation source) alongside `:resume-url` and `v-model:file`.

---

## Find Jobs Page (Feature 09)

`app/pages/find-jobs/index.vue` replaces its PagePlaceholder stub. **Page shell is gray, not white** — `min-h-[calc(100vh-5rem)] w-full bg-background px-6 py-8 md:px-8` (overrides the layout's white `main`), inner column `mx-auto flex max-w-[1160px] flex-col gap-6`. Cards sit on the gray background so they read as separate panels (the design-driven counterpart to the profile page's white `bg-surface` shell). Composes `<FindJobsSearchControls>`, then a `gap-4` group of `<FindJobsFilters>` + `<FindJobsTable>`. UI + mock data only — search/filter/sort/paging logic is features 10/11. Built to `designs/find-jobs.png`; **no SOURCE column** (design omits it, though build-plan lists one).

### Match Score Bar (`app/components/find-jobs/MatchScoreBar.vue`)

File: `app/components/find-jobs/MatchScoreBar.vue`
Last updated: 2026-06-24

Props: `score: number`. Reusable inline progress bar + percentage (also feeds the feature-12 job-details score).

| Element     | Class / value                                                                 |
| ----------- | ----------------------------------------------------------------------------- |
| Track       | `h-1.5 w-16 overflow-hidden rounded-full bg-border-light`                      |
| Fill        | `h-full rounded-full` + color class, `:style="{ width: `${score}%` }"`        |
| Percentage  | `text-[14px] font-semibold text-text-primary`                                 |
| Row         | `flex items-center gap-2.5`                                                    |

**Score color thresholds (read off the design — overrides ui-tokens/ui-rules):** `score >= 90` → `bg-success` (green); `>= 80` → `bg-info` (blue); else `bg-warning` (orange). The design colors 94/96/91 green, 88/85 blue, 72 orange — design is the source of truth.

### Search Controls (`app/components/find-jobs/SearchControls.vue`)

File: `app/components/find-jobs/SearchControls.vue`
Last updated: 2026-06-24 (feature 10 — wired to the Adzuna agent)

- Canonical white **Card** (`rounded-2xl border border-border bg-surface p-6` + shadow). Row `flex flex-col gap-4 md:flex-row md:items-end`: two flex-1 fields (**Job Title**, **Location**) + the **Find Jobs** accent button.
- **Input with leading icon** — wrap input in `relative`; input is `w-full rounded-md border border-border bg-surface py-2.5 pl-9 pr-3 text-[14px] …` (the `py-2.5` form-control height, `pl-9` to clear the icon) with a `pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted` search SVG. Labels reuse the profile-form label class (`mb-1.5 block text-[12px] font-medium uppercase tracking-wide text-text-secondary`). Inputs `v-model` to `jobTitle`/`location`, `@keyup.enter` submits, `disabled` (with `disabled:opacity-60`) while loading.
- **Find Jobs button** — accent primary at input height: `inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-[14px] font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-60`. Leading 16px search SVG, swapped for an `animate-spin` spinner + "Searching…" label while the request is in flight. Click → `$fetch('/api/agent/find', { jobTitle, location })`.
- **Result banner (conditional)** — shown only after a search. Success (`v-if="result"`): same `border-success-light bg-success-lightest … text-success-foreground` card with the `text-success` sparkles SVG and `role="status"`, text now **dynamic** — "Found {count} job(s) and saved {strongMatches} strong match(es)." Error (`v-else-if="errorMessage"`): `rounded-xl border border-error bg-surface px-4 py-3 text-[14px] font-medium text-error`, `role="alert"`. (The job table + filters below still read mock data — DB wiring is feature 11.)

### Job Filters (`app/components/find-jobs/Filters.vue`)

File: `app/components/find-jobs/Filters.vue`
Last updated: 2026-06-25 (feature 11 — wired to shared useJobs state)

- Bar on the gray background (no card): `flex flex-col gap-3 sm:flex-row sm:items-center`. A flex-1 icon-input ("Filter by company or role…", same leading-icon pattern as SearchControls) + a `gap-3` group of two styled native `<select>`s.
- **Select (button-style)** — `cursor-pointer appearance-none rounded-md border border-border bg-surface py-2.5 pl-4 pr-9 text-[14px] font-medium text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent`, wrapped in `relative` with a `pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted` chevron SVG.
- **Wired (feature 11):** `v-model`s the shared `useJobs()` state — input → `query`, match select → `matchFilter` (`all`/`high`/`low`), sort select → `sort` (`score`/`newest`/`oldest`). `Table.vue` derives its rows from these reactively; this component holds no local state.

### Jobs Table (`app/components/find-jobs/Table.vue`)

File: `app/components/find-jobs/Table.vue`
Last updated: 2026-06-25 (feature 11 — filter/sort/search wired)

- **Real data** via `useJobs()` (shared `useState` list, newest-first by `found_at`). Mock rows removed. `app/composables/useJobs.ts` exposes `jobs`/`filteredJobs`/`loading`/`loaded`/`query`/`matchFilter`/`sort`/`refresh`; the page loads it on mount (`onMounted` → `ensureLoaded` → `refresh`), and `SearchControls` calls `refresh()` after a run so a completed search appears immediately.
- **Filter/sort (feature 11):** the table paginates `filteredJobs` (a computed in `useJobs` applying match filter + case-insensitive company/title search + sort over the in-memory list — all client-side, no re-query). Controls live in `Filters.vue`. Page resets to 1 on any `filteredJobs`/`query`/`matchFilter`/`sort` change.
- White **Card** with `overflow-hidden` wrapping an `overflow-x-auto` scroller + semantic `<table class="w-full min-w-[760px] border-collapse">`.
- **Header** (`<thead class="bg-surface-secondary">`): th = `px-6 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-text-secondary`. Columns: Company, Role, Match Score, Salary Est., Date Found.
- **States**: `loading && !loaded` → centered "Loading jobs…" row (`colspan=5`); `loaded && hasJobsButNoMatches` (jobs exist but filtered out) → "No matching jobs" + "Try adjusting your filters…"; `loaded && total===0` (no jobs at all) → "No jobs yet" + "Run a search above…"; else the rows.
- **Rows**: `<tr class="cursor-pointer border-t border-border hover:bg-surface-secondary">`, click → `navigateTo('/find-jobs/{id}')` (job details, feature 12). Cells `px-6 py-4 text-[14px]`. Company = `h-9 w-9 rounded-md border` logo placeholder (building SVG) + `font-semibold` name (`job.company`). Role = `job.title`, Salary = `job.salary ?? '—'`, Date Found = `formatRelativeTime(job.found_at)` (`lib/utils.ts`). Match Score renders `<FindJobsMatchScoreBar :score="job.match_score ?? 0">`.
- **Pagination footer** (shown only when `total > 0`): real **client-side paging**, `PAGE_SIZE = 20`. "Showing {rangeStart} to {rangeEnd} of {total} results". Pager appears only when `pageCount > 1`: Previous/Next (disabled at bounds, `disabled:opacity-50`) + compact numbered buttons (`pageItems` windows with `…` when >7 pages). Active page = `border border-accent bg-accent text-accent-foreground`.

---

## Job Details Page (Feature 12)

`app/pages/find-jobs/[id].vue` replaces its PagePlaceholder stub. **Gray page shell** (same as find-jobs: `min-h-[calc(100vh-5rem)] w-full bg-background px-6 py-8 md:px-8`) but a **narrower single column** `mx-auto flex max-w-[820px] flex-col gap-6` (the design centers one column). Composes, top to bottom: a **Back to Jobs** `NuxtLink` (`inline-flex w-fit items-center gap-1.5 text-[14px] font-medium text-text-secondary hover:text-text-primary` + chevron-left), then `<JobDetailsHeader>`, `<JobDetailsInfoCards>`, `<JobDetailsMatchReasoning>`, `<JobDetailsSkillsComparison>`, `<JobDetailsJobDescription>`, `<JobDetailsCompanyResearch>`, and the **Apply Now** button. Real DB data via `useJobs().fetchJob(id)` (RLS-scoped single-row read), loaded in `onMounted` after `ensureLoaded()`. Three page states: **loading skeleton** (stacked `h-28`/`h-20`/`h-40 animate-pulse rounded-2xl border border-border bg-surface-secondary` blocks), **"Job not found"** card (canonical card, centered), and the details. All section cards use the canonical white **Card** (`rounded-2xl border border-border bg-surface p-6` + shadow).

### Job Details — section label vs heading conventions

Two label styles, matched to the design: the top two cards use a **small uppercase label** `text-[12px] font-semibold uppercase tracking-wide text-text-secondary` ("AI Match Reasoning", "Required Skills vs Your Profile"); the bottom two use a **titlecase heading** `text-[16px] font-semibold leading-6 text-text-primary` ("Job Description", "Company Research"). Each leads with a 16px inline lucide-style SVG (`h-4 w-4`): sparkle `text-accent` (match reasoning), file-text `text-text-secondary` (job description), building `text-text-secondary` (company research).

### Job Header card (`app/components/job-details/Header.vue`)

Props: `job: Job`. Logo placeholder = `h-14 w-14 shrink-0 rounded-xl border border-border bg-surface-secondary text-text-muted` building SVG (`h-6 w-6`). Title `text-[24px] font-bold leading-8 text-text-primary`. Sub-row (`mt-1.5 flex flex-wrap items-center gap-2 text-[14px]`): company `text-text-secondary` + chevron-right (`h-3.5 w-3.5 text-text-muted`) + **match score** `font-semibold` colored text. **View Job Post** = top-right text link (`inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary` + external-link SVG), `<a target="_blank" rel="noopener noreferrer">` → `external_apply_url ?? source_url`, hidden when neither exists.

**Header match-score color (distinct from `MatchScoreBar`):** colored text, not a bar — `90+` → `text-success`, `>= MATCH_THRESHOLD` (70) → `text-warning` (amber), else `text-error`. This renders the design's amber 86% (the bar's 90/80 scale would show blue). Intentional; the bar component is unchanged.

### Job Info Cards (`app/components/job-details/InfoCards.vue`)

Props: `job: Job`. Row `grid grid-cols-2 gap-4 lg:grid-cols-4`. Each card `flex items-center gap-3 rounded-2xl border border-border bg-surface p-4` + shadow: a `h-9 w-9 shrink-0 rounded-lg` tinted icon chip + (value `truncate text-[14px] font-semibold text-text-primary` / label `text-[11px] font-medium uppercase tracking-wide text-text-muted`). Chip tints per card: **Salary** `bg-success-lightest text-success` (dollar), **Location** `bg-info-lightest text-info-dark` (map-pin), **Job Type** `bg-surface-tertiary text-text-secondary` (briefcase), **Date Found** `bg-accent-light text-accent` (calendar). `job_type` humanized (`fulltime`→"Full-time"…); all values fall back to `—` / `formatRelativeTime` for the date.

### Skill badges — matched vs gap (`app/components/job-details/SkillsComparison.vue`)

Props: `job: Job` (reads `matched_skills`/`missing_skills`). Two groups under `text-[12px] font-medium text-text-secondary` sublabels ("You have" / "Gap skills"), each a `flex flex-wrap gap-2`. **Matched badge** (green): `inline-flex items-center gap-1.5 rounded-full bg-success-lightest px-3 py-1 text-[12px] font-medium text-success-foreground` + check SVG `h-3 w-3 text-success`. **Gap badge** (amber): same shape with `bg-warning-light text-warning-dark` + a plus SVG `h-3 w-3`. Groups hide when their array is empty; a no-skills fallback line shows when both are empty. **This green/amber split (design-driven) overrides the feat-05 note that pointed missing badges at `bg-accent-muted`** — that guidance does not apply to the job-details design.

### Job Description card (`app/components/job-details/JobDescription.vue`)

Props: `job: Job`. Renders `about_role` in a `whitespace-pre-line text-[14px] leading-6 text-text-secondary` paragraph — **no line-clamp** (the full stored text always shows). Adzuna's search API only returns a **truncated snippet** (ends in an ellipsis), so when the text is truncated (`endsWith('…' | '...')`) and a posting URL exists, a footer (`mt-4 … border-t border-border pt-4 text-[13px]`) shows "This is a preview from the job board." + a **Read the full description** accent link (`text-accent hover:text-accent-dark` + external-link SVG) → `external_apply_url ?? source_url`. The full posting text is not in our DB — recovering it would require scraping the source (not done here).

### Company Research card — empty state (`app/components/job-details/CompanyResearch.vue`)

Props: `companyName: string | null`. Header row (`flex items-center justify-between`): building icon + "Company Research" heading, and a **Research Company** button on the right (`inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-foreground hover:bg-accent-dark` + search SVG). **Button is inert in feature 12** — the research agent is wired in feature 13 (kept visually active to match the design; flagged with a code comment). Empty state: centered `flex flex-col items-center justify-center gap-2 py-10 text-center` — building SVG `h-8 w-8 text-text-muted`, "No research yet" (`text-[14px] font-medium text-text-secondary`), and the design copy interpolating `{companyName}` (`max-w-sm text-[13px] leading-5 text-text-muted`). The full 9-field dossier render is feature 13.

### Apply Now button (`app/pages/find-jobs/[id].vue`)

Full-width accent CTA: `inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-[15px] font-semibold text-accent-foreground hover:bg-accent-dark`. Renders as `<a target="_blank" rel="noopener noreferrer">` → `external_apply_url ?? source_url` with label "Apply Now at {company}"; when no URL exists, a `disabled` button variant (`cursor-not-allowed … opacity-60`, label "Apply Now"). A `rounded-xl` full-width primary — taller (`py-3.5`) than the form Primary Button.

### New tokens — warning tints

Added `--color-warning-light` (#ffedd5) and `--color-warning-dark` (#c2410c) to `main.css` (`:root` + `@theme inline`) for the gap-skill badges (`bg-warning-light text-warning-dark`). Same sanctioned `@theme inline` route as the feat-05 error tints.

---

## Dashboard Page (Feature 14)

`app/pages/dashboard.vue` replaces its placeholder stub. **Gray page shell** (same as find-jobs: `min-h-[calc(100vh-5rem)] w-full bg-background px-6 py-8 md:px-8`, inner `mx-auto flex max-w-[1160px] flex-col gap-6`). Three rows: `<DashboardStatsBar>`; a `grid grid-cols-1 gap-6 lg:grid-cols-5` row with `<DashboardRecentActivity class="lg:col-span-2">` + `<DashboardCompanyResearchChart class="lg:col-span-3">`; a `grid grid-cols-1 gap-6 lg:grid-cols-2` row with `<DashboardJobsFoundChart>` + `<DashboardMatchScoreChart>`. Built to `designs/dashboard.png` (overrides stale build-plan labels — 4th stat is "Jobs This Week", top-right chart is "Company Research Activity"). **Stat cards (feature 15) and Recent Activity (feature 16) are real data; the three charts are still mock (feature 17).** The page loads both in `onMounted` (`ensureLoaded()` → `Promise.all([useDashboardStats().refresh(), useRecentActivity().refresh()])`), same client-side pattern as find-jobs/profile. **No incomplete-profile banner and no sign-out control** — the design shows neither (see progress-tracker for the sign-out regression note). All cards are the canonical white **Card** (`rounded-2xl border border-border bg-surface p-6` + shadow).

### Stat Card (`app/components/dashboard/StatCard.vue`)

Props: `label: string`, `value: string`, `note: string`, `trend?: string`, `trendPositive?: boolean` (default `true`). Presentational — `StatsBar.vue` feeds it real data from `useDashboardStats()` (feature 15). Canonical card, `flex flex-col gap-2`.

| Element     | Class                                                              |
| ----------- | ----------------------------------------------------------------- |
| Label       | `text-[14px] font-medium text-text-secondary`                     |
| Value       | `text-[30px] font-semibold leading-9 text-text-primary`           |
| Trend pill  | `rounded-sm px-2 py-0.5 text-[12px] font-medium` + `:class` → green `bg-success-lightest text-success-darker` (positive/zero) or red `bg-error-lightest text-error` (negative). Shown only when `trend` is set. |
| Note        | `text-[12px] text-text-muted` (e.g. "vs last week" / "Total researched") |

The ui-tokens "Trend Badges" spec realized — `rounded-sm` (not pill). Pill is **direction-colored** (green up / red down) since feature 15 made the trend a real week-over-week delta; the design only showed the green/positive state. Cards 1–2 carry a trend pill (hidden when there's no prior-week baseline); cards 3–4 show the note only.

### Stats Bar real-data wiring (`StatsBar.vue` + `useDashboardStats.ts`)

`StatsBar.vue` consumes `useDashboardStats()` (`stats`, `loaded`). While `!loaded` it renders four `h-[120px] animate-pulse rounded-2xl border border-border bg-surface-secondary` skeleton cards (SSR shows these; the client hydrates real figures after auth), then the real `StatCard`s. `app/composables/useDashboardStats.ts` derives the four stats + week-over-week trends as a `computed` over `useJobs().jobs` (no aggregate round-trip — counts are small). Reusable skeleton pattern: a fixed-height `animate-pulse` block matching the real card's footprint.

### Recent Activity (`app/components/dashboard/RecentActivity.vue` + `useRecentActivity.ts`)

Canonical card. Heading `text-[16px] font-semibold leading-6 text-text-primary`. **Real data (feature 16)** via `useRecentActivity()` (`activities`, `loaded`). Three states: 5 skeleton rows (halo + two `animate-pulse rounded bg-surface-secondary` lines) while `!loaded`; an **empty state** (`flex flex-1 flex-col items-center justify-center gap-1 py-10 text-center` — "No activity yet" `text-text-secondary` + helper `text-text-muted`) when loaded with no entries; else `<ul class="mt-5 flex flex-col gap-5">`. Each row: `flex items-start gap-3` — a **halo dot** + (`text-[14px] font-medium text-text-primary` text / `text-[12px] text-text-muted` timestamp).

**Halo dot:** `mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full` outer ring + `h-2 w-2 rounded-full` inner dot (the ui-tokens Activity Dots — 16px outer / 8px inner). **Two colors keyed on entry `type`** (`Record<"search" | "research", string>`): `search` (completed job search = "job found") → green `bg-success-light`/`bg-success-alt`; `research` (company dossier) → info blue `bg-info-light`/`bg-info`. **This supersedes the feature-14 mock's 3-color accent/info/success scheme** — the build-plan feature-16 spec defines exactly these two types/colors.

`useRecentActivity.ts` merges completed `agent_runs` (own query) with `jobs.company_research` (from `useJobs`), sorts by timestamp desc, caps at `ACTIVITY_LIMIT = 6`. Entry text: `"Found N job(s) for {title}"` / `"Researched {company}"` + `formatRelativeTime`.

### Dashboard charts — inline-SVG pattern (`CompanyResearchChart.vue`, `JobsFoundChart.vue`, `MatchScoreChart.vue`)

**Dependency-free inline SVG — not recharts** (React-only, unusable in Vue and never installed). Each is a canonical card: heading, then `mt-6 flex flex-1 gap-3` = a y-axis HTML column (`flex w-5/w-7 flex-col justify-between py-1 text-right text-[11px] text-text-muted`, one `<span>` per tick) + a `flex-1 flex-col` holding the plot and an x-axis HTML row (`mt-2 flex` of `flex-1 text-center text-[11px] text-text-muted` labels, one per bar/point so they center-align with the marks).

**Plot SVG:** `viewBox="0 0 100 100" preserveAspectRatio="none" class="h-full w-full"` inside an `h-[220px]` box. Coordinates computed in script as percentages (`value/max*100`). Gridlines: `<line>` per y-tick, `stroke="var(--color-border)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"`. Labels live in HTML (not SVG `<text>`) so the non-uniform `preserveAspectRatio="none"` scaling never distorts text.

- **Bar charts** (`CompanyResearchChart` blue `fill="var(--color-info)"`, max 12; `MatchScoreChart` green `fill="var(--color-success)"`, max 100): `<rect rx="1.2">`, slot = `100/n`, bar width = `slotWidth*0.42`, centered.
- **Line chart** (`JobsFoundChart`, purple): points at slot centers `(i+0.5)*slotWidth`; smooth path via per-segment cubic béziers with horizontal control tangents (`buildLinePath`). `<path stroke="var(--color-accent)" stroke-width="2.5" vector-effect="non-scaling-stroke">` over an area `<path fill="url(#jobsFoundFill)">` (vertical `linearGradient`, accent `stop-opacity` 0.25 → 0). Honors the ui-tokens "Dashboard Chart Colors" table; all colors via CSS-var tokens (no hex).

Feature 17 swaps the mock `data` arrays in each for real PostHog series — the SVG/label rendering stays.
