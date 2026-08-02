import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

// Baseline e2e suite runs against the LEGACY app (../baraabar-tailor-ai)
// during the migration — see docs/nextjs-migration-plan.md §4. Once a
// route is ported here, point PLAYWRIGHT_BASE_URL at this Next.js app's
// dev/preview server instead for that spec.
const LEGACY_APP_DIR = path.resolve(__dirname, "../baraabar-tailor-ai");
const LEGACY_APP_PORT = 4001;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${LEGACY_APP_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Every spec here targets a single shared dev-server instance of the
  // legacy app (not per-test isolated backends), so too much parallelism
  // causes resource-contention flakiness rather than real failures —
  // capped rather than left at Playwright's CPU-count default.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${LEGACY_APP_PORT} --strictPort`,
        cwd: LEGACY_APP_DIR,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
