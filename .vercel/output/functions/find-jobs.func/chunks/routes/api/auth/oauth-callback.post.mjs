import { d as defineEventHandler, r as readBody, a as createError, l as getCookie, m as createInsforgeAuthActions, n as deleteCookie } from '../../../_/nitro.mjs';
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
const oauthCallback_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const code = body == null ? void 0 : body.code;
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: "Missing authorization code" });
  }
  const codeVerifier = getCookie(event, VERIFIER_COOKIE);
  const auth = createInsforgeAuthActions(event);
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);
  deleteCookie(event, VERIFIER_COOKIE);
  if (error) {
    console.error("[api/auth/oauth-callback]", error);
    throw createError({ statusCode: 401, statusMessage: "Sign-in could not be completed" });
  }
  return { user: (_a = data == null ? void 0 : data.user) != null ? _a : null };
});

export { oauthCallback_post as default };
//# sourceMappingURL=oauth-callback.post.mjs.map
