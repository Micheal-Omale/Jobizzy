<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'Signing you in… · Jobizzy'
})

const route = useRoute()
const { user, refresh } = useAuth()
const { track } = useAnalytics()

onMounted(async () => {
  // SSR browser clients do not auto-exchange OAuth callbacks, so hand the code
  // to the server route: it completes the PKCE exchange and sets the session
  // cookies. refresh() then reads the new access cookie and identifies the user.
  const code = (route.query.code ?? route.query.insforge_code) as string | undefined

  try {
    if (!code) throw new Error('Missing authorization code')
    await $fetch('/api/auth/oauth-callback', { method: 'POST', body: { code } })
    await refresh()
  } catch (error) {
    console.error('[pages/auth/callback]', error)
  }

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
