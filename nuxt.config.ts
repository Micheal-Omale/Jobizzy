// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@posthog/nuxt'],
  // The @posthog/nuxt module reads its options under the `posthogConfig` key
  // (see the module's `configKey`), not `posthog` — using the wrong key meant
  // publicKey was undefined and PostHog initialized without a token.
  posthogConfig: {
    publicKey: process.env.NUXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NUXT_PUBLIC_POSTHOG_HOST,
  },
  runtimeConfig: {
    public: {
      insforgeUrl: '',
      insforgeAnonKey: ''
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
