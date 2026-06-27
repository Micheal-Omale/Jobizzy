import { d as defineEventHandler, r as readBody, a as createError, m as createInsforgeAuthActions, o as setCookie } from '../../../_/nitro.mjs';
import '@browserbasehq/stagehand';
import '@google/genai';
import 'pdfmake/src/printer.js';
import '@insforge/sdk/ssr';
import 'posthog-node';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@posthog/core/vendor/uuidv7';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const VERIFIER_COOKIE = "insforge_oauth_verifier";
const oauthStart_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const provider = body == null ? void 0 : body.provider;
  const redirectTo = body == null ? void 0 : body.redirectTo;
  if (!provider || !redirectTo) {
    throw createError({ statusCode: 400, statusMessage: "Missing provider or redirectTo" });
  }
  const auth = createInsforgeAuthActions(event);
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo,
    skipBrowserRedirect: true
  });
  if (error || !(data == null ? void 0 : data.url)) {
    console.error("[api/auth/oauth-start]", error);
    throw createError({ statusCode: 502, statusMessage: "Could not start sign-in" });
  }
  if (data.codeVerifier) {
    setCookie(event, VERIFIER_COOKIE, data.codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600
    });
  }
  return { url: data.url };
});

export { oauthStart_post as default };
//# sourceMappingURL=oauth-start.post.mjs.map
