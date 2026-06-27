import { a as useState, n as navigateTo, b as useNuxtApp } from './server.mjs';
import { computed } from 'vue';

function usePostHog() {
  const { $posthog } = useNuxtApp();
  return $posthog?.();
}
function useAnalytics() {
  function track(event, props) {
    usePostHog()?.capture(event, props);
  }
  function identify(user) {
    usePostHog()?.identify(user.id, {
      email: user.email,
      name: user.profile?.name,
      providers: user.providers
    });
  }
  function reset() {
    usePostHog()?.reset();
  }
  return { track, identify, reset };
}
const GENERIC_OAUTH_ERROR = "Could not start sign-in. Please try again.";
function useAuth() {
  const user = useState("auth:user", () => null);
  const loaded = useState("auth:loaded", () => false);
  const isAuthenticated = computed(() => user.value !== null);
  async function refresh() {
    let authedUser = null;
    try {
      const { user: current } = await $fetch("/api/auth/me");
      if (current) {
        authedUser = current;
      } else {
        await $fetch("/api/auth/refresh", { method: "POST" }).catch(() => {
        });
        const { user: retried } = await $fetch("/api/auth/me");
        authedUser = retried;
      }
    } catch (error) {
      console.error("[composables/useAuth] refresh", error);
      authedUser = null;
    }
    user.value = authedUser;
    if (authedUser) {
      useAnalytics().identify(authedUser);
    }
    loaded.value = true;
  }
  async function ensureLoaded() {
    if (loaded.value) return;
    await refresh();
  }
  async function signInWithOAuth(provider) {
    try {
      const redirectTo = `${(void 0).location.origin}/auth/callback`;
      const { url } = await $fetch("/api/auth/oauth-start", {
        method: "POST",
        body: { provider, redirectTo }
      });
      if (!url) {
        return { success: false, error: GENERIC_OAUTH_ERROR };
      }
      (void 0).location.href = url;
      return { success: true };
    } catch (error) {
      console.error("[composables/useAuth] signInWithOAuth", error);
      return { success: false, error: GENERIC_OAUTH_ERROR };
    }
  }
  async function signOut() {
    try {
      await $fetch("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("[composables/useAuth] signOut", error);
    } finally {
      const analytics = useAnalytics();
      analytics.track("signed_out");
      analytics.reset();
      user.value = null;
      loaded.value = true;
      await navigateTo("/login");
    }
  }
  return {
    user,
    isAuthenticated,
    refresh,
    ensureLoaded,
    signInWithOAuth,
    signOut
  };
}

export { useAnalytics as a, useAuth as u };
//# sourceMappingURL=useAuth-DqhK3zbv.mjs.map
