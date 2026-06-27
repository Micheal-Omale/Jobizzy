import { d as defineEventHandler, q as toWebRequest, v as sendWebResponse, e as useRuntimeConfig } from '../../../_/nitro.mjs';
import { createRefreshAuthRouter } from '@insforge/sdk/ssr';
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

const refresh_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { POST } = createRefreshAuthRouter({
    baseUrl: config.public.insforgeUrl,
    anonKey: config.public.insforgeAnonKey
  });
  const response = await POST(toWebRequest(event));
  return sendWebResponse(event, response);
});

export { refresh_post as default };
//# sourceMappingURL=refresh.post.mjs.map
