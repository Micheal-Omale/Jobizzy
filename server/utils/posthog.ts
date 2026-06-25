import { PostHog } from 'posthog-node'

// Server-side PostHog client for capturing agent events (job_search_started,
// job_found). flushAt:1 / flushInterval:0 send each event immediately since
// Nitro request handlers are short-lived and would otherwise exit before a
// batched flush. ALWAYS `await client.shutdown()` before the handler returns —
// events are lost without it.
export function createPostHogServer(): PostHog {
  const config = useRuntimeConfig()
  return new PostHog(config.public.posthogKey, {
    host: config.public.posthogHost,
    flushAt: 1,
    flushInterval: 0
  })
}
