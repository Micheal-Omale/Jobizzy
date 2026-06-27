import type { InsForgeClient } from '@insforge/sdk'

export type AuthUser = NonNullable<
  Awaited<ReturnType<InsForgeClient['auth']['getCurrentUser']>>['data']['user']
>

type OAuthProvider = 'google' | 'github'

type AuthResult = { success: boolean; error?: string }

const GENERIC_OAUTH_ERROR = 'Could not start sign-in. Please try again.'

// Client-only hint that this device has an active sign-in. It holds no secret —
// just a boolean — so the session check (getCurrentUser → /api/auth/refresh) is
// only made when a session plausibly exists. Without it, every logged-out page
// load fires a guaranteed 401. Set on a successful refresh, cleared on sign-out
// or any failed/expired session, so it self-heals if it ever goes stale.
const AUTH_HINT_KEY = 'jp:authed'

function readAuthHint(): boolean {
  if (!import.meta.client) return false
  try {
    return localStorage.getItem(AUTH_HINT_KEY) === '1'
  } catch {
    return false
  }
}

function writeAuthHint(authed: boolean): void {
  if (!import.meta.client) return
  try {
    if (authed) localStorage.setItem(AUTH_HINT_KEY, '1')
    else localStorage.removeItem(AUTH_HINT_KEY)
  } catch {
    // localStorage unavailable (e.g. private mode) — fall back to always checking,
    // which stays correct, just noisier.
  }
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const loaded = useState<boolean>('auth:loaded', () => false)

  const isAuthenticated = computed<boolean>(() => user.value !== null)

  async function refresh(): Promise<void> {
    // Resolve the session server-side: /api/auth/me reads the httpOnly-free
    // access cookie via the server client (server mode). The browser client's
    // getCurrentUser() can't rehydrate a user from a cookie alone — it falls
    // back to a cross-origin backend refresh that 401s on every page load.
    let authedUser: AuthUser | null = null

    try {
      const { user: current } = await $fetch<{ user: AuthUser | null }>('/api/auth/me')

      if (current) {
        authedUser = current
      } else {
        // No user from the access cookie — it may simply be expired. Mint a fresh
        // one from the httpOnly refresh cookie (the local refresh route reads it
        // correctly), then re-check. If there's no refresh cookie either, this is
        // just a logged-out user and the retry returns null.
        await $fetch('/api/auth/refresh', { method: 'POST' }).catch(() => {})
        const { user: retried } = await $fetch<{ user: AuthUser | null }>('/api/auth/me')
        authedUser = retried
      }
    } catch (error) {
      console.error('[composables/useAuth] refresh', error)
      authedUser = null
    }

    user.value = authedUser
    writeAuthHint(Boolean(authedUser))
    // Associate this PostHog session with the signed-in user as soon as we know
    // who they are, so events captured later are attributed correctly.
    if (authedUser) {
      useAnalytics().identify(authedUser)
    }

    loaded.value = true
  }

  async function ensureLoaded(): Promise<void> {
    if (loaded.value) return
    // Skip the session lookup when this device has no auth hint (never signed in
    // here, or signed out) — this is what removes the logged-out 401 on
    // /api/auth/refresh. The OAuth callback page calls refresh() directly, so a
    // first-time sign-in still resolves even though no hint exists yet.
    if (import.meta.client && !readAuthHint()) {
      user.value = null
      loaded.value = true
      return
    }
    await refresh()
  }

  async function signInWithOAuth(provider: OAuthProvider): Promise<AuthResult> {
    try {
      // OAuth initiation runs server-side (SSR auth): the route mints the
      // provider URL and stashes the PKCE verifier in an httpOnly cookie, so the
      // callback route can complete the exchange and own the session cookies.
      const redirectTo = `${window.location.origin}/auth/callback`
      const { url } = await $fetch<{ url: string }>('/api/auth/oauth-start', {
        method: 'POST',
        body: { provider, redirectTo }
      })

      if (!url) {
        return { success: false, error: GENERIC_OAUTH_ERROR }
      }

      window.location.href = url
      return { success: true }
    } catch (error) {
      console.error('[composables/useAuth] signInWithOAuth', error)
      return { success: false, error: GENERIC_OAUTH_ERROR }
    }
  }

  async function signOut(): Promise<void> {
    try {
      // Server-side sign-out revokes the session and clears the auth cookies.
      await $fetch('/api/auth/signout', { method: 'POST' })
    } catch (error) {
      console.error('[composables/useAuth] signOut', error)
    } finally {
      // Capture the event while the user is still identified, then reset so the
      // identity does not leak into the next session on this device.
      const analytics = useAnalytics()
      analytics.track('signed_out')
      analytics.reset()

      writeAuthHint(false)
      user.value = null
      loaded.value = true
      await navigateTo('/login')
    }
  }

  return {
    user,
    isAuthenticated,
    refresh,
    ensureLoaded,
    signInWithOAuth,
    signOut
  }
}
