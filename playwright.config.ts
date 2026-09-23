import { tmpdir } from "node:os";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: path.join(tmpdir(), `tsa-playwright-${process.pid}`),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    storageState: { cookies: [], origins: [] },
  },
  projects: [{
    name: "chromium",
    use: { ...devices["Desktop Chrome"], channel: process.env.PLAYWRIGHT_CHANNEL },
  }],
  webServer: {
    command: "npm run build && python3 tests/e2e/serve.py 3100 out",
    url: "http://127.0.0.1:3100/modules/ai-foundations/quiz/",
    env: { NEXT_PUBLIC_SPLINE_SCENE_URL: "" },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
