# 🎨 Design Brief — Redesign Jobizzy

> Paste this into Claude (claude.ai or Claude Code) to redesign the whole site
> **and design a logo**. It is tailored to this codebase: Nuxt 4 + Vue 3 +
> Tailwind v4 with a CSS-first `@theme` token system in
> `app/assets/css/main.css`.
>
> **Brand name is "Jobizzy" everywhere.** (The codebase currently has leftover
> "JobPilot" copy/logo — replace all of it with Jobizzy.)

---

## 1. What you're designing

Jobizzy is an **AI-powered job-hunting copilot** for tech professionals. Users
connect their profile/resume, and the app:

- Finds relevant jobs (search by title/location or paste a job link)
- Scores each role against the user's real skills (a **match score %**)
- Auto-researches each company before you apply
- Tracks every application and shows progress on a dashboard

**Tagline idea:** "Job hunting, but smart." / "Your AI job copilot."

**Tone:** confident, modern, intelligent, calm. The name "Jobizzy" is friendly
and a little energetic — the design should feel approachable but still premium,
never childish. It should feel like a premium
productivity tool (Linear, Vercel, Notion, Stripe Dashboard) — not a noisy job
board. Trustworthy and focused, because job hunting is stressful and the
product's promise is "we remove the chaos."

## 2. Tech constraints (must respect)

- **Framework:** Nuxt 4 + Vue 3 `<script setup>`, components in `.vue` SFCs.
- **Styling:** Tailwind CSS v4 with a **CSS-first `@theme` token system** (no
  `tailwind.config.js`). All colors/spacing/radii are CSS variables in
  `app/assets/css/main.css`.
- **Use the existing semantic tokens** (don't invent raw hex in components):
  `bg-surface`, `text-text-primary`, `text-text-secondary`, `text-text-muted`,
  `border-border`, `bg-accent`, `text-accent`, `bg-success`, `bg-warning`,
  `bg-info`, `text-linkedin`, etc.
- Font is **Inter**. Icons: a clean line-icon set (e.g. Lucide).
- Output should be **production-ready Vue components using Tailwind utility
  classes**, not Figma mockups.

## 3. Design direction — *Refined Current*

Keep and elevate the existing "**framed editorial / dashboard**" aesthetic.
Don't reinvent the look — make it more premium and polished:

- **Visible structure:** thin 1px borders (`border-border`), framed content
  blocks, subtle hatch/grid dividers as accents — used with more restraint and
  clearer rhythm than today.
- **Generous whitespace**, strong typographic hierarchy, large confident
  headings.
- **Soft depth:** subtle shadows and gradients only where they add meaning
  (hero, key cards), never everywhere.
- **Purple (`#7c5cfc`) as the single hero accent.** Use color semantically:
  green = good match/success, amber = medium match/warning, blue/LinkedIn-blue =
  source/info, red = error. Never use accent purple as plain decoration.
- Deliver a polished **dark mode** alongside light (see §4).

## 4. Design system to produce

Tighten the system first, then apply it.

- **Color tokens (light + dark):** keep/extend the existing semantic set
  (surface, border, text-primary/secondary/muted, accent, success, warning,
  info, error, linkedin). **Define a full dark-mode value for every token** —
  the token file currently has an empty `@media (prefers-color-scheme: dark)`
  placeholder. Ensure WCAG AA contrast in both themes.
- **Typography scale:** define display / h1 / h2 / h3 / body-lg / body / small /
  caption with sizes, weights, line-heights (Inter).
- **Spacing & radius:** consistent scale; radii from the existing
  `--radius-sm … --radius-xl`.
- **Core components (restyle all):** Button (primary/secondary/ghost/
  destructive), Input/Select/Textarea, Badge/Pill (match score, source tags),
  Card, Table/row, Tabs, Progress bar (match score), Avatar/company-logo chip,
  Stat card, Chart container, Empty state, Toast, Modal, Nav/sidebar.

## 5. Pages to redesign (screen-by-screen)

**Marketing**

1. **Home** (`app/pages/index.vue`) — Hero (headline "Job hunting is hard. Your
   tools shouldn't be."), product screenshot, two feature sections ("Manage Your
   Job Search With Ease", "Apply With More Confidence"), testimonial, bottom CTA.
   Elevate the hero; keep the framed-block feature layout but refine it.
2. **Login** (`app/pages/login.vue`) — clean, centered, trustworthy auth screen
   (social + email).

**App (authenticated)**

3. **Dashboard** (`app/pages/dashboard.vue`) — stats bar (jobs found, avg match
   score, companies researched, applications), 2–3 charts (jobs found over time,
   match-score distribution, company research), recent activity feed.
4. **Find Jobs — list** (`app/pages/find-jobs/index.vue`) — search controls
   (title/location or paste link), filters, results **table** with company logo,
   **match-score bar + %**, salary estimate, source tag (LinkedIn/URL). The
   match score is the hero element of each row.
5. **Job Detail** (`app/pages/find-jobs/[id].vue`) — header (title/company/
   apply), info cards, **match reasoning** (why it fits), **skills comparison**
   (have vs. missing), job description, **AI company research** panel.
6. **Profile** (`app/pages/profile.vue`) — profile form, resume upload, profile-
   completion indicator.

For each page give: layout structure, component usage, responsive behavior
(mobile-first), and empty/loading states.

## 6. Logo design (Jobizzy)

Design a logo system for **Jobizzy**, not just a single image.

- **Concept:** A modern AI job copilot. Lean into either (a) a clean wordmark
  with a distinctive letterform tweak (e.g. the "J", the dotted "i", or the "zz"
  given motion/energy), or (b) a simple geometric mark + wordmark lockup. The
  "zz" in Jobizzy is a natural place for personality (speed, ease, momentum) —
  but keep it tasteful, not cartoonish.
- **Symbol ideas to explore:** a compass/pilot arrow (navigation toward the
  right job), a spark/star (AI smartness), an upward path/progress mark, or a
  subtle checkmark woven into a letter. Pick one strong idea — don't combine
  many.
- **Color:** primary accent purple `#7c5cfc` as the brand color. Provide a
  full-color version, a single-color (monochrome) version, and a knockout
  (white) version for dark backgrounds.
- **Type:** geometric/clean sans (Inter pairs well, or a slightly more
  characterful display sans for the wordmark only).
- **Deliverables:**
  - **SVG** for everything (scalable, crisp). This is the priority — the site
    currently uses `public/logo.png`; replace it with an SVG/optimized asset.
  - Primary logo lockup (mark + "Jobizzy" wordmark), horizontal.
  - Standalone **icon/mark** (square) for favicon, app icon, and the navbar at
    small sizes.
  - Wordmark-only version.
  - Light-background and dark-background variants.
  - A favicon (square mark) for `public/`.
- **Constraints:** must read clearly at 24px (navbar/favicon) and scale up
  cleanly; works in one color; no fine detail that disappears when small.

## 7. Signature UI moments (make these shine)

- **Match score visualization** — the product's core value. Design a memorable,
  scannable component (bar + % + color-coded tier: green ≥85, blue 70–84, amber
  <70). Reuse everywhere.
- **AI company research** — present AI-gathered info as a confident, structured
  insight panel (not a wall of text).
- **Skills comparison** — clear "you have / you're missing" visual.

## 8. Deliverables

1. **Jobizzy logo set** as SVG (primary lockup, icon/mark, wordmark; light +
   dark variants; favicon) — see §6.
2. Updated `@theme` token block (**light + dark**) for
   `app/assets/css/main.css`.
3. A short **design-system reference** (colors, type scale, spacing, component
   variants).
4. Restyled Vue components for the pages above, using only semantic Tailwind
   tokens.
5. Mobile + desktop layouts; accessible (WCAG AA contrast, focus states,
   keyboard nav).

## 9. Rules

- Use semantic tokens, never raw hex in components.
- Keep it consistent: one accent, purposeful color, consistent spacing rhythm.
- Prioritize clarity and scannability over decoration — every element earns its
  place.
- Match the existing Vue 3 `<script setup>` + Tailwind v4 conventions so it drops
  into the codebase.
- **Rename all "JobPilot" references to "Jobizzy"** in copy, alt text, and
  assets (e.g. `app/components/layout/Navbar.vue`, `Hero.vue`, `public/logo.png`).

---

## Appendix — current component inventory (for reference)

```
app/pages/
  index.vue            login.vue            dashboard.vue
  profile.vue          find-jobs/index.vue  find-jobs/[id].vue
  auth/callback.vue

app/components/
  layout/        Navbar.vue, Footer.vue
  homepage/      Hero.vue, Features.vue, Testimonial.vue, BottomCta.vue
  dashboard/     StatsBar.vue, StatCard.vue, RecentActivity.vue,
                 JobsFoundChart.vue, MatchScoreChart.vue, CompanyResearchChart.vue
  find-jobs/     SearchControls.vue, Filters.vue, Table.vue, MatchScoreBar.vue
  job-details/   Header.vue, InfoCards.vue, MatchReasoning.vue,
                 SkillsComparison.vue, JobDescription.vue, CompanyResearch.vue
  profile/       ProfileForm.vue, ResumeUpload.vue, CompletionIndicator.vue
```

## Appendix — existing color tokens (extend these; add dark values)

```
Surfaces:  background #f6f7fb, surface #ffffff, surface-secondary #f9fafb,
           surface-tertiary #f2f5f7, surface-muted #f4f5fb
Borders:   border #e7eaf3, border-light #e5e7eb, border-muted #dfe1e7
Text:      text-primary #101828, text-secondary #6a7282, text-muted #99a1af,
           text-dark #364153, text-slate #272835
Accent:    accent #7c5cfc, accent-dark #5e4cff, accent-light #f3e8ff
Success:   success #10b981 (+ light/dark variants)
Info:      info #61a8ff, info-dark #155dfc, info-medium #2b7fff
Warning:   warning #ff8904
Error:     error #ef4444
LinkedIn:  linkedin #0a66c2
Radius:    sm 4px, md 8px, lg 12px, xl 16px, full 9999px
Font:      Inter
```
