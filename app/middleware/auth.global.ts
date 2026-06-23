const PROTECTED_PREFIXES = ['/dashboard', '/profile', '/find-jobs']

function isProtected(path: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  )
}

export default defineNuxtRouteMiddleware(async (to) => {
  // The InsForge browser client only resolves the session client-side, so the
  // guard runs on the client. Protected pages render nothing meaningful before
  // hydration (their content is auth-scoped), so there is no SSR content leak.
  if (import.meta.server) return

  const { user, ensureLoaded } = useAuth()
  await ensureLoaded()

  if (isProtected(to.path) && !user.value) {
    return navigateTo('/login')
  }

  if (to.path === '/login' && user.value) {
    return navigateTo('/dashboard')
  }
})
