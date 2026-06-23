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

> **Note — `app/pages/dashboard.vue` is a placeholder stub** (greeting + sign-out card) until feature 14 builds the real dashboard. It currently hosts the only sign-out UI.

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
Used by the stub pages `app/pages/profile.vue` (feat 05), `app/pages/find-jobs/index.vue` (feat 09), `app/pages/find-jobs/[id].vue` (feat 12). Shares the same shell + Card as the dashboard stub. Delete usages as each real page is built.
