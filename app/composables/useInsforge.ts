import { createClient, type InsForgeClient } from '@insforge/sdk'

// Browser-side InsForge client. Session lives in an httpOnly cookie that the SDK
// manages, so a single cached instance per browser is correct. Never used in
// server context — Nitro routes use the server client (server/utils/insforge.ts).
let browserClient: InsForgeClient | null = null

export function useInsforge(): InsForgeClient {
  const config = useRuntimeConfig()

  const create = (): InsForgeClient =>
    createClient({
      baseUrl: config.public.insforgeUrl,
      anonKey: config.public.insforgeAnonKey
    })

  if (import.meta.client) {
    if (!browserClient) {
      browserClient = create()
    }
    return browserClient
  }

  return create()
}
