import { createInsforgeAuthActions } from '../../utils/insforge'

// Begins the PKCE OAuth flow server-side. The SDK returns the provider URL plus
// a one-time `codeVerifier` we must hold until the callback — stash it in an
// httpOnly cookie (never exposed to JS) so the exchange route can complete PKCE.
const VERIFIER_COOKIE = 'insforge_oauth_verifier'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ provider?: string; redirectTo?: string }>(event)
  const provider = body?.provider
  const redirectTo = body?.redirectTo

  if (!provider || !redirectTo) {
    throw createError({ statusCode: 400, statusMessage: 'Missing provider or redirectTo' })
  }

  const auth = createInsforgeAuthActions(event)
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo,
    skipBrowserRedirect: true
  })

  if (error || !data?.url) {
    console.error('[api/auth/oauth-start]', error)
    throw createError({ statusCode: 502, statusMessage: 'Could not start sign-in' })
  }

  if (data.codeVerifier) {
    setCookie(event, VERIFIER_COOKIE, data.codeVerifier, {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax',
      path: '/',
      maxAge: 600
    })
  }

  return { url: data.url }
})
