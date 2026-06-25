import { createBrowserClient } from '@insforge/sdk/ssr'

type BrowserClient = ReturnType<typeof createBrowserClient>

// Browser-side InsForge client (SSR mode). The session lives in cookies the
// server owns: a non-httpOnly `insforge_access_token` this client reads and uses
// as the bearer for DB / Storage / Functions / Realtime, plus an httpOnly
// `insforge_refresh_token` it never sees. When the access token is missing or
// near expiry the client POSTs `refreshUrl` (a Nitro route) to mint a new one.
//
// Its `auth` surface is read-only here (getCurrentUser) — sign-in, OAuth code
// exchange, and sign-out all run server-side through `server/api/auth/*` so they
// can write the auth cookies. Never used in server context — Nitro routes use
// the server client (server/utils/insforge.ts).
let browserClient: BrowserClient | null = null

export function useInsforge(): BrowserClient {
  const config = useRuntimeConfig()

  const create = (): BrowserClient =>
    createBrowserClient({
      baseUrl: config.public.insforgeUrl,
      anonKey: config.public.insforgeAnonKey,
      refreshUrl: '/api/auth/refresh'
    })

  if (import.meta.client) {
    if (!browserClient) {
      browserClient = create()
    }
    return browserClient
  }

  return create()
}
