import { d as defineEventHandler, c as createInsforgeServer } from '../../../_/nitro.mjs';
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

const me_get = defineEventHandler(async (event) => {
  var _a;
  const insforge = createInsforgeServer(event);
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error) {
    return { user: null };
  }
  return { user: (_a = data == null ? void 0 : data.user) != null ? _a : null };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
