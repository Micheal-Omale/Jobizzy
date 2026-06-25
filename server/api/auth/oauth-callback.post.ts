import { createInsforgeAuthActions } from '../../utils/insforge'

// Completes the PKCE OAuth flow. Reads the verifier stashed by oauth-start,
// exchanges the provider `code` for a session, and (via the cookie-writing auth
// actions) sets the access + refresh cookies. SSR browser clients do NOT
// auto-exchange callbacks, so this must happen here.
const VERIFIER_COOKIE = 'insforge_oauth_verifier'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string }>(event)
  const code = body?.code

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Missing authorization code' })
  }

  const codeVerifier = getCookie(event, VERIFIER_COOKIE)
  const auth = createInsforgeAuthActions(event)
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier)

  // One-time verifier — clear it whether or not the exchange succeeded.
  deleteCookie(event, VERIFIER_COOKIE)

  if (error) {
    console.error('[api/auth/oauth-callback]', error)
    throw createError({ statusCode: 401, statusMessage: 'Sign-in could not be completed' })
  }

  return { user: data?.user ?? null }
})
