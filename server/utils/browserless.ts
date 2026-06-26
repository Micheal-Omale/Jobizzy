import { Stagehand } from "@browserbasehq/stagehand";

export function createStagehand() {
  const config = useRuntimeConfig();
  
  return new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      cdpUrl: `${process.env.BROWSERLESS_WS_URL}?token=${process.env.BROWSERLESS_API_KEY}`,
    },
    model: "google/gemini-2.5-flash",
    logger: () => {},
  });
}
