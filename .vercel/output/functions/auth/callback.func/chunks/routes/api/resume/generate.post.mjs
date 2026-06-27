import { d as defineEventHandler, r as readBody, a as createError, A as generateResumePdf, B as setHeader, i as isTransientError } from '../../../_/nitro.mjs';
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

const generate_post = defineEventHandler(async (event) => {
  var _a, _b;
  const profile = await readBody(event);
  if (!profile || typeof profile !== "object") {
    throw createError({ statusCode: 400, statusMessage: "No profile provided.", message: "No profile provided." });
  }
  const hasRole = Array.isArray(profile.work_experience) && profile.work_experience.some((role) => (role == null ? void 0 : role.company) || (role == null ? void 0 : role.title));
  if (!((_a = profile.full_name) == null ? void 0 : _a.trim()) || !((_b = profile.current_title) == null ? void 0 : _b.trim()) || !hasRole) {
    const message = "Add your name, current title, and at least one work experience entry before generating a r\xE9sum\xE9.";
    throw createError({ statusCode: 422, statusMessage: message, message });
  }
  try {
    const pdf = await generateResumePdf(profile);
    setHeader(event, "Content-Type", "application/pdf");
    setHeader(event, "Content-Disposition", 'inline; filename="resume.pdf"');
    return pdf;
  } catch (error) {
    console.error("[api/resume/generate]", error);
    const busy = isTransientError(error);
    const message = busy ? "The r\xE9sum\xE9 generator is busy right now. Please try again in a moment." : "Could not generate your r\xE9sum\xE9 right now. Please try again.";
    throw createError({ statusCode: busy ? 503 : 502, statusMessage: message, message });
  }
});

export { generate_post as default };
//# sourceMappingURL=generate.post.mjs.map
