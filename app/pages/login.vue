<script setup lang="ts">
import { useRoute } from 'vue-router'

definePageMeta({
  layout: false
})

useHead({
  title: 'Sign in · JobPilot'
})

const route = useRoute()
const { signInWithOAuth } = useAuth()
const { track } = useAnalytics()

const loadingProvider = ref<'google' | 'github' | null>(null)
const errorMessage = ref<string>(
  route.query.error ? 'Sign-in didn’t complete. Please try again.' : ''
)

async function handleOAuth(provider: 'google' | 'github'): Promise<void> {
  if (loadingProvider.value) return

  errorMessage.value = ''
  loadingProvider.value = provider
  track('sign_in_started', { provider })

  const { success, error } = await signInWithOAuth(provider)

  if (!success) {
    track('sign_in_failed', { provider, reason: error })
    errorMessage.value = error ?? 'Something went wrong. Please try again.'
    loadingProvider.value = null
  }
  // On success the browser is redirected to the provider by the SDK — keep the
  // loading state until navigation takes over.
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
    <div class="w-full max-w-md">
      <NuxtLink to="/" class="mb-8 flex justify-center">
        <img src="/public/logo.png" alt="JobPilot" class="h-9 w-auto" />
      </NuxtLink>

      <div
        class="rounded-2xl border border-border bg-surface p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
      >
        <h1 class="text-center text-[24px] font-bold leading-8 text-text-primary">
          Welcome to JobPilot
        </h1>
        <p class="mt-2 text-center text-[14px] leading-5 text-text-secondary">
          Sign in to find your next role faster.
        </p>

        <p
          v-if="errorMessage"
          role="alert"
          class="mt-6 rounded-md border border-error px-4 py-3 text-[13px] leading-5 text-error"
        >
          {{ errorMessage }}
        </p>

        <div class="mt-8 flex flex-col gap-3">
          <button
            type="button"
            :disabled="loadingProvider !== null"
            class="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 text-[14px] font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleOAuth('google')"
          >
            <!-- Official Google brand mark — brand colors are exempt from design tokens -->
            <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.67 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
              />
            </svg>
            <span>{{ loadingProvider === 'google' ? 'Redirecting…' : 'Continue with Google' }}</span>
          </button>

          <button
            type="button"
            :disabled="loadingProvider !== null"
            class="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 text-[14px] font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleOAuth('github')"
          >
            <!-- Official GitHub brand mark -->
            <svg class="h-5 w-5 text-text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.78-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
              />
            </svg>
            <span>{{ loadingProvider === 'github' ? 'Redirecting…' : 'Continue with GitHub' }}</span>
          </button>
        </div>
      </div>

      <p class="mt-6 text-center text-[12px] leading-4 text-text-muted">
        By continuing you agree to JobPilot&rsquo;s Terms and Privacy Policy.
      </p>
    </div>
  </div>
</template>
