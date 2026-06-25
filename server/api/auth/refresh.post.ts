import { createRefreshAuthRouter } from '@insforge/sdk/ssr'

// The `refreshUrl` the browser client POSTs to when its access token is missing
// or near expiry. createRefreshAuthRouter reads the httpOnly refresh cookie from
// the request and sets a fresh access cookie on the response — we just bridge
// h3's event to the Web Request/Response it expects.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { POST } = createRefreshAuthRouter({
    baseUrl: config.public.insforgeUrl,
    anonKey: config.public.insforgeAnonKey
  })

  const response = await POST(toWebRequest(event))
  return sendWebResponse(event, response)
})
