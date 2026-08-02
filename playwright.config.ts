import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

// Two projects, run against two different apps at once during the
// migration — see docs/nextjs-migration-plan.md §4/§9:
//   - "legacy": the still-live TanStack Start app (../baraabar-tailor-ai),
//     covering everything not yet ported here.
//   - "next-app": this Next.js app itself, covering pages as they land
//     (Phase 1: Home, Design; more each phase).
// As a route is ported, its legacy spec (if any) should move to
// docs/nextjs-migration-plan.md's "ported" list and a next-app spec
// should exist covering the same behavior.
const LEGACY_APP_DIR = path.resolve(__dirname, "../baraabar-tailor-ai");
const LEGACY_APP_PORT = 4001;
const legacyBaseURL = process.env.PLAYWRIGHT_LEGACY_BASE_URL ?? `http://localhost:${LEGACY_APP_PORT}`;
const NEXT_APP_PORT = 3000;
const nextAppBaseURL = process.env.PLAYWRIGHT_NEXT_BASE_URL ?? `http://localhost:${NEXT_APP_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Every spec here targets a shared dev-server instance (not per-test
  // isolated backends), so too much parallelism causes resource-
  // contention flakiness rather than real failures — capped rather than
  // left at Playwright's CPU-count default.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "legacy",
      testDir: "./e2e/legacy",
      use: { ...devices["Desktop Chrome"], baseURL: legacyBaseURL },
    },
    {
      name: "next-app",
      testDir: "./e2e/next-app",
      use: { ...devices["Desktop Chrome"], baseURL: nextAppBaseURL },
    },
  ],
  webServer: [
    {
      command: `npm run dev -- --port ${LEGACY_APP_PORT} --strictPort`,
      cwd: LEGACY_APP_DIR,
      url: legacyBaseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `npm run dev -- --port ${NEXT_APP_PORT}`,
      cwd: __dirname,
      url: nextAppBaseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
