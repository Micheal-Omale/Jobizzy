import { createBrowserClient } from '@insforge/sdk/ssr';
import { c as useRuntimeConfig } from './server.mjs';

function useInsforge() {
  const config = useRuntimeConfig();
  const create = () => createBrowserClient({
    baseUrl: config.public.insforgeUrl,
    anonKey: config.public.insforgeAnonKey,
    refreshUrl: "/api/auth/refresh"
  });
  return create();
}

export { useInsforge as u };
//# sourceMappingURL=useInsforge-DhfvSzIK.mjs.map
