import { createServerClient, createAuthActions, type CookieStore } from '@insforge/sdk/ssr'
import { getCookie, setCookie, deleteCookie, type H3Event } from 'h3'

// Shared baseUrl/anonKey for every server-side InsForge client. Read per-request
// (inside a handler) so runtimeConfig is resolved from env.
function insforgeConfig() {
  const config = useRuntimeConfig()
  return {
    baseUrl: config.public.insforgeUrl,
    anonKey: config.public.insforgeAnonKey
  }
}

// Adapts h3's request/response cookies to the SDK's CookieStore (read + write).
// In h3 the request and response cookie stores are the same event, so a single
// adapter covers both `cookies` and request/response split usages.
export function h3CookieStore(event: H3Event): CookieStore {
  return {
    get: (name: string) => getCookie(event, name),
    set: (a: unknown, b?: unknown, c?: unknown) => {
      if (typeof a === 'string') {
        setCookie(event, a, (b as string) ?? '', c as Parameters<typeof setCookie>[3])
      } else {
        const { name, value, ...opts } = a as { name: string; value: string }
        setCookie(event, name, value, opts)
      }
    },
    delete: (a: unknown) => {
      deleteCookie(event, typeof a === 'string' ? a : (a as { name: string }).name)
    }
  } as CookieStore
}

// Authenticated server-side InsForge client — reads the access-token cookie and
// uses it as the per-request bearer. The ONLY way server routes act as the
// signed-in user. Never use the browser client in server context.
export function createInsforgeServer(event: H3Event) {
  return createServerClient({
    ...insforgeConfig(),
    cookies: { get: (name: string) => getCookie(event, name) }
  })
}

// Cookie-writing auth actions (OAuth initiate / code exchange / sign-out). These
// mutate the auth cookies via the h3 store, so they only run server-side.
export function createInsforgeAuthActions(event: H3Event) {
  return createAuthActions({
    ...insforgeConfig(),
    cookies: h3CookieStore(event)
  })
}
