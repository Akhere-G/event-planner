import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const port = process.env.E2E_PORT ?? "4173";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  expect: { timeout: 10_000 },
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "html",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Always test the production build (never the dev server, which compiles
  // each lazy route on demand mid-test). CI has already built it; locally
  // the server rebuilds first. The port differs from `npm run dev` so the two
  // can run side by side.
  webServer: {
    command: isCI
      ? `npm run preview -- --port ${port} --strictPort`
      : `npm run build && npm run preview -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
