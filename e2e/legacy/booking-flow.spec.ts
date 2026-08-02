import { test, expect, type Page } from "@playwright/test";

// Baseline for the most critical, most recently-changed part of the app —
// see docs/nextjs-migration-plan.md §4/§6. Things this guards against
// regressing during the port:
//   1. Outfit through Measure (steps 1-5) work fully signed out; landing on
//      Pickup (step 6) without a session shows a static "sign in to
//      continue" gate with an explicit button — not an auto-redirect (that
//      caused a redirect ping-pong on back navigation, see git history)
//      and not at the very start or only at final submission.
//   2. Back/swipe navigation steps back one screen at a time instead of
//      exiting the wizard — this was a real bug fixed shortly before this
//      migration started (see git history on booking-store.ts).
//   3. A stale `step` left in localStorage from an earlier, abandoned
//      session (e.g. Hero's "Book Now" CTA links to plain /book, no
//      ?category=) clamps back to what the persisted draft data actually
//      supports, rather than resuming mid-air on a step with no
//      category/garments chosen, or straight on the Pickup gate.
//
// Deliberately avoids requiring a seeded Supabase test account: it only
// exercises the parts of the flow reachable while signed out. Once a test
// account exists, extend this with the authenticated path (Pickup, Review,
// actual submission, order confirmation).

async function selectFirstCategory(page: Page) {
  await expect(page.getByText("Who are we stitching for?")).toBeVisible();
  await page.locator("main button").first().click();
}

async function selectFirstGarment(page: Page) {
  await expect(page.getByText("What are we making?")).toBeVisible();
  // GarmentTypeCard renders two overlapping click targets that both call
  // onToggle (the card "plate" and an image button that visually overflows
  // on top of it — see src/components/GarmentTypeCard.tsx). Target the
  // image button directly since it's the one actually on top.
  await page.locator("main").locator("button:has(img)").first().click();
}

test("unauthenticated booking wizard works through Measure, then shows a sign-in gate before Pickup", async ({
  page,
}) => {
  await page.goto("/book");

  await selectFirstCategory(page);
  await selectFirstGarment(page);

  await page.getByRole("button", { name: "Continue" }).click(); // Design (optional)
  await expect(page.getByText("Show us what you want")).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click(); // Fabric (optional)
  await expect(page.getByText(/What type of fabric/i)).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click(); // Measure
  await expect(page.getByText("How should we measure")).toBeVisible();
  // Defaults to "sample" mode already, so Continue is enabled without
  // picking anything — this is intentional product behavior, not a gap.
  await page.getByRole("button", { name: "Continue" }).click();

  // Pickup requires an account — signed out, this shows a static gate
  // (not an auto-redirect, see module comment above) with its own
  // explicit "Sign in" button.
  await expect(page.getByText("Sign in to continue")).toBeVisible();
  await expect(page).toHaveURL(/\/book/);

  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth/);
});

test("back navigation steps back one screen at a time, not out of the wizard", async ({
  page,
}) => {
  // Navigate in from the homepage (not page.goto("/book") directly) so
  // there's a genuine prior history entry to land on once the wizard's
  // own step history is exhausted — otherwise "back" has nowhere to go
  // and the assertion below would pass for the wrong reason.
  await page.goto("/");
  await page.getByRole("link", { name: "Book pickup" }).click();
  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();

  await selectFirstCategory(page);
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();

  // Continue is disabled until a garment is picked — clicking it while
  // disabled would just hang waiting for actionability, so pick first.
  await selectFirstGarment(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Step 3 of \d+/)).toBeVisible();

  // The regression this guards: browser back must land on step 2, not
  // exit straight to the homepage.
  await page.goBack();
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();
  await expect(page).toHaveURL(/\/book/);

  await page.goBack();
  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
  await expect(page).toHaveURL(/\/book/);

  // One more back from the first step should finally leave the wizard.
  await page.goBack();
  await expect(page).not.toHaveURL(/\/book/);
});

test("clicking the in-app Back button repeatedly walks back through every step", async ({
  page,
}) => {
  // Distinct from the browser-back test above: this clicks the actual
  // footer "Back" button element (onClick={back} -> window.history.back())
  // rather than driving browser-back directly, and walks several steps
  // deep first — the scenario a user reported still skipping straight to
  // home from a few steps in. Stops at step 4 (Measure), not step 5
  // (Pickup), since Pickup now requires signing in first.
  await page.goto("/");
  await page.getByRole("link", { name: "Book pickup" }).click();
  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();

  await selectFirstCategory(page);
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();

  await selectFirstGarment(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Step 3 of \d+/)).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Step 4 of \d+/)).toBeVisible();

  const backButton = page.getByRole("button", { name: "Back", exact: true }).last();
  for (const expectedStep of [3, 2, 1]) {
    await backButton.click();
    await expect(page.getByText(new RegExp(`Step ${expectedStep} of \\d+`))).toBeVisible();
    await expect(page).toHaveURL(/\/book/);
  }
  await backButton.click();
  await expect(page).not.toHaveURL(/\/book/);
});

test("a restored handoff landing on Pickup while still signed out clamps back to Measure", async ({
  page,
}) => {
  // Defensive path: not just the Continue-click transition, but the
  // resume-on-mount guard. Simulates coming back from a genuine handoff
  // (e.g. clicked "Sign in" on the Pickup gate, then closed that tab
  // without actually signing in) — draft + step 5 both present, matching
  // what persistDraftForHandoff actually writes, but still no session.
  await page.goto("/book");
  await page.evaluate(() => {
    localStorage.setItem(
      "baraabar_booking_draft_v2",
      JSON.stringify({
        category: "women",
        items: [{ garment: "Shirt", quantity: 1, references: [] }],
        fabrics: [],
        notes: "",
        wantsStylistCall: false,
        measurementMode: "sample",
        address: { line1: "", line2: "", city: "", pincode: "", phone: "" },
        deliverySame: true,
      }),
    );
    localStorage.setItem("baraabar_booking_step_v1", "5");
  });
  await page.reload();
  await expect(page).not.toHaveURL(/\/auth/);
  await expect(page.getByText(/Step 5 of \d+/)).toBeVisible();
  await expect(page.getByText("How should we measure")).toBeVisible();
});
