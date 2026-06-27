import { d as defineEventHandler, m as createInsforgeAuthActions, x as h3CookieStore } from '../../../_/nitro.mjs';
import { clearAuthCookies } from '@insforge/sdk/ssr';
import '@browserbasehq/stagehand';
import '@google/genai';
import 'pdfmake/src/printer.js';
import 'posthog-node';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@posthog/core/vendor/uuidv7';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const signout_post = defineEventHandler(async (event) => {
  const auth = createInsforgeAuthActions(event);
  try {
    await auth.signOut();
  } catch (error) {
    console.error("[api/auth/signout]", error);
  } finally {
    clearAuthCookies(h3CookieStore(event));
  }
  return { ok: true };
});

export { signout_post as default };
//# sourceMappingURL=signout.post.mjs.map
