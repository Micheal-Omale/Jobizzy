import { createInsforgeServer } from '../../utils/insforge'

// Returns the currently signed-in user (or null) by reading the access-token
// cookie server-side. The browser InsForge client cannot rehydrate a user from
// the cookie alone — its getCurrentUser() falls back to a cross-origin refresh
// that 401s — so the session check must run through the server client, which
// runs in server mode and validates the access cookie against the backend.
export default defineEventHandler(async (event) => {
  const insforge = createInsforgeServer(event)
  const { data, error } = await insforge.auth.getCurrentUser()

  // A 401/expired token here just means no active session — surface as a null
  // user, not an error. The caller refreshes and retries when appropriate.
  if (error) {
    return { user: null }
  }

  return { user: data?.user ?? null }
})
