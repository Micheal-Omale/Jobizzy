// Stagehand is loaded lazily (dynamic import) rather than at module top-level.
// This file lives in server/utils, which Nuxt auto-imports into the global
// server chunk that handles every request. A static import here pulled the
// heavy @browserbasehq/stagehand tree into that chunk, so if Vercel failed to
// bundle it the entire site 500'd at boot — even the homepage and favicon.
// Importing it inside the function confines the dependency to this code path.
export async function createStagehand() {
  const { Stagehand } = await import("@browserbasehq/stagehand");
  const config = useRuntimeConfig();

  return new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      cdpUrl: `${process.env.BROWSERLESS_WS_URL}?token=${process.env.BROWSERLESS_API_KEY}`,
    },
    model: { modelName: "gpt-4o", apiKey: process.env.OPENAI_API_KEY },
    logger: () => {},
  });
}
