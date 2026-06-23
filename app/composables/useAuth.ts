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
    const insforge = useInsforge()
    const { data, error } = await insforge.auth.getCurrentUser()

    if (error) {
      // A 401 here just means there is no active session yet (logged-out user) —
      // the normal unauthenticated state, not a failure worth surfacing.
      if (error.statusCode !== 401) {
        console.error('[composables/useAuth] refresh', error)
      }
      user.value = null
      writeAuthHint(false)
    } else {
      user.value = data.user
      writeAuthHint(Boolean(data.user))
      // Associate this PostHog session with the signed-in user as soon as we
      // know who they are, so events captured later are attributed correctly.
      if (data.user) {
        useAnalytics().identify(data.user)
      }
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
      const insforge = useInsforge()
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await insforge.auth.signInWithOAuth(provider, { redirectTo })

      if (error) {
        console.error('[composables/useAuth] signInWithOAuth', error)
        return { success: false, error: GENERIC_OAUTH_ERROR }
      }

      return { success: true }
    } catch (error) {
      console.error('[composables/useAuth] signInWithOAuth', error)
      return { success: false, error: GENERIC_OAUTH_ERROR }
    }
  }

  async function signOut(): Promise<void> {
    try {
      const insforge = useInsforge()
      await insforge.auth.signOut()
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
