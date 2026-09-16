import { defineConfig, devices } from "@playwright/test";
const PORT = 4173;
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: `npm run build && npx serve out -l ${PORT} --no-clipboard`, url: `http://127.0.0.1:${PORT}/`, reuseExistingServer: !process.env.CI, timeout: 180_000 }
});
