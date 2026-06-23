<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'Signing you in… · JobPilot'
})

const { user, refresh } = useAuth()
const { track } = useAnalytics()

onMounted(async () => {
  // getCurrentUser() automatically completes the pending OAuth callback
  // (exchanges insforge_code for a session) before resolving. refresh() also
  // identifies the user in PostHog once the session resolves.
  await refresh()

  if (user.value) {
    track('sign_in_completed')
    await navigateTo('/dashboard')
  } else {
    track('sign_in_failed', { reason: 'oauth_callback' })
    await navigateTo('/login?error=oauth')
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background px-6">
    <div
      class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
      aria-hidden="true"
    />
    <p class="mt-4 text-[14px] font-medium text-text-secondary">Signing you in&hellip;</p>
  </div>
</template>
