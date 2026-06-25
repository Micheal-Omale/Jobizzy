import type { AuthUser } from './useAuth'

/**
 * Custom product events we send to PostHog.
 *
 * Pageviews, click autocapture and unhandled errors are already captured by the
 * @posthog/nuxt module — this union is only the domain events we fire by hand,
 * kept as a closed set so event names stay consistent across the app.
 */
export type AnalyticsEvent =
  | 'sign_in_started'
  | 'sign_in_completed'
  | 'sign_in_failed'
  | 'signed_out'
  | 'cta_clicked'
  | 'profile_completed'

type AnalyticsProps = Record<string, unknown>

export function useAnalytics() {
  // usePostHog() (auto-imported from @posthog/nuxt) returns the posthog-js client
  // on the client and undefined during SSR, so every call is optional-chained and
  // is a harmless no-op on the server.
  function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
    usePostHog()?.capture(event, props)
  }

  // Tie subsequent events to the signed-in user so PostHog can build per-user
  // funnels instead of attributing everything to anonymous device ids. Calling
  // this repeatedly with the same id is idempotent.
  function identify(user: AuthUser): void {
    usePostHog()?.identify(user.id, {
      email: user.email,
      name: user.profile?.name,
      providers: user.providers
    })
  }

  // Clear the identity on sign-out so the next person on this device is tracked
  // as a fresh, anonymous user.
  function reset(): void {
    usePostHog()?.reset()
  }

  return { track, identify, reset }
}
