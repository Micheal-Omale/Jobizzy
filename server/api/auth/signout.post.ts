import { clearAuthCookies } from '@insforge/sdk/ssr'
import { createInsforgeAuthActions, h3CookieStore } from '../../utils/insforge'

// Revokes the session server-side and clears the auth cookies. clearAuthCookies
// is a belt-and-braces follow-up so the browser is definitively logged out even
// if the revoke call fails.
export default defineEventHandler(async (event) => {
  const auth = createInsforgeAuthActions(event)

  try {
    await auth.signOut()
  } catch (error) {
    console.error('[api/auth/signout]', error)
  } finally {
    clearAuthCookies(h3CookieStore(event))
  }

  return { ok: true }
})
