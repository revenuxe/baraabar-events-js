import { test, expect } from "@playwright/test";

// Smoke test — proves the baseline suite is wired up against the legacy
// app before any route migrates. See docs/nextjs-migration-plan.md §4.
test("home page loads with the header and footer", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("img", { name: "Baraabar" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Book pickup" })).toBeVisible();
});
