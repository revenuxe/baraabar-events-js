import { test, expect } from "@playwright/test";

// Baseline for the admin auth gap this migration is meant to close (see
// docs/nextjs-migration-plan.md §7): the legacy app only checks
// session + has_role client-side, after the admin bundle has already
// shipped and mounted. This spec pins down the *current*, observable
// behavior (eventual redirect to /admin/login) so we can prove the new
// app's middleware-based gate is at least as correct — and, unlike this
// version, blocks the redirect server-side before any admin HTML ships.
test("visiting the admin dashboard while signed out redirects to admin login", async ({
  page,
}) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
});
