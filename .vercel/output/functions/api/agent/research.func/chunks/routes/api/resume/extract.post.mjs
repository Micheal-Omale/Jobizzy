import { d as defineEventHandler, y as readFormData, a as createError, z as extractProfileFromText, i as isTransientError } from '../../../_/nitro.mjs';
import { PDFParse } from 'pdf-parse';
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

const MAX_BYTES = 5 * 1024 * 1024;
const MIN_TEXT_LENGTH = 100;
const extract_post = defineEventHandler(async (event) => {
  var _a;
  const form = await readFormData(event);
  const file = form.get("resume");
  if (!(file instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: "No r\xE9sum\xE9 file provided." });
  }
  if (file.type !== "application/pdf") {
    throw createError({ statusCode: 400, statusMessage: "R\xE9sum\xE9 must be a PDF." });
  }
  if (file.size > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: "R\xE9sum\xE9 must be 5MB or smaller." });
  }
  const data = new Uint8Array(await file.arrayBuffer());
  let text = "";
  try {
    const parser = new PDFParse({ data });
    try {
      const parsed = await parser.getText();
      text = (_a = parsed.text) != null ? _a : "";
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    console.error("[api/resume/extract] pdf-parse", error);
    throw createError({
      statusCode: 422,
      statusMessage: "Could not extract text from this PDF. Please try a different file.",
      message: "Could not extract text from this PDF. Please try a different file."
    });
  }
  if (text.trim().length < MIN_TEXT_LENGTH) {
    throw createError({
      statusCode: 422,
      statusMessage: "Could not extract text from this PDF. Please try a different file.",
      message: "Could not extract text from this PDF. Please try a different file."
    });
  }
  try {
    const data2 = await extractProfileFromText(text);
    return { data: data2 };
  } catch (error) {
    console.error("[api/resume/extract] gemini", error);
    const busy = isTransientError(error);
    const message = busy ? "The r\xE9sum\xE9 extractor is busy right now. Please try again in a moment." : "Could not read your r\xE9sum\xE9 right now. Please try again.";
    throw createError({ statusCode: busy ? 503 : 502, statusMessage: message, message });
  }
});

export { extract_post as default };
//# sourceMappingURL=extract.post.mjs.map
