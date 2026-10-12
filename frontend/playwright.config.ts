import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3010",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node tests/e2e/start-backend.mjs",
      url: "http://127.0.0.1:8010/api/v1/vacancy-options",
      reuseExistingServer: false,
      timeout: 120_000,
      name: "Laravel E2E",
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3010",
      url: "http://127.0.0.1:3010",
      env: { PLAYWRIGHT_E2E: "1", NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8010/api/v1" },
      reuseExistingServer: false,
      timeout: 120_000,
      name: "Next.js E2E",
    },
  ],
});
