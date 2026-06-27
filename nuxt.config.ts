// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap'
        }
      ]
    }
  },
  modules: ['@posthog/nuxt'],
  // The @posthog/nuxt module reads its options under the `posthogConfig` key
  // (see the module's `configKey`), not `posthog` — using the wrong key meant
  // publicKey was undefined and PostHog initialized without a token.
  posthogConfig: {
    publicKey: process.env.NUXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NUXT_PUBLIC_POSTHOG_HOST,
  },
  runtimeConfig: {
    // Server-private. Mapped from GEMINI_API_KEY in .env (the auto NUXT_ prefix
    // doesn't apply since the var isn't named NUXT_GEMINI_API_KEY), so set it
    // explicitly. Never expose under `public` — this is a secret.
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    // Adzuna credentials — same explicit-mapping reason as geminiApiKey. Note
    // the key var in .env is ADZUNA_API_KEY (not ADZUNA_APP_KEY as the build-plan
    // wrote it) — match the real env name or Adzuna 400s with empty credentials.
    adzunaAppId: process.env.ADZUNA_APP_ID ?? '',
    adzunaAppKey: process.env.ADZUNA_API_KEY ?? '',
    // Browserless replaces Browserbase (unavailable in our region) for company
    // research. Stagehand connects to the remote Chrome over CDP using these.
    // Secrets — never expose under `public`.
    browserlessApiKey: process.env.BROWSERLESS_API_KEY ?? '',
    browserlessWsUrl: process.env.BROWSERLESS_WS_URL ?? '',
    public: {
      insforgeUrl: '',
      insforgeAnonKey: '',
      // Auto-filled from NUXT_PUBLIC_POSTHOG_KEY/HOST. Exposed so the server-side
      // posthog-node client (server/utils/posthog.ts) can capture agent events.
      posthogKey: '',
      posthogHost: ''
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
