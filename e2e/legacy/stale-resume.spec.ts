import { test, expect } from "@playwright/test";

// There is no continuous background persistence anymore (see
// booking-store.ts) — progress only survives via an explicit one-shot
// handoff (Save for later while signed out, or the Pickup sign-in gate),
// which writes both the draft AND its step together right before
// navigating to /auth, and is consumed (then cleared) exactly once on the
// next /book mount. A lone leftover step key with no matching draft can no
// longer happen through normal use, and even if it somehow did, the mount
// effect only restores when BOTH keys are present together.
test("'Start Designing' with no prior handoff always starts fresh at Outfit", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Start Designing" }).click();

  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
  await expect(page.getByText("Who are we stitching for?")).toBeVisible();
});

test("refreshing mid-flow with no completed handoff resets to step 1, not the step you were on", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Book pickup" }).click();
  await page.locator("main button").first().click(); // category -> step 2
  await expect(page.getByText(/Step 2 of \d+/)).toBeVisible();

  await page.reload();

  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
  await expect(page.getByText("Who are we stitching for?")).toBeVisible();
});

test("a completed handoff (matching draft + step) is restored once, then cleared", async ({
  page,
}) => {
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
    localStorage.setItem("baraabar_booking_step_v1", "2");
  });

  await page.reload();

  await expect(page.getByText(/Step 3 of \d+/)).toBeVisible();
  await expect(page.getByText("Show us what you want")).toBeVisible();

  // Consumed, not left behind for a later, unrelated visit to pick up.
  const remaining = await page.evaluate(() => ({
    draft: localStorage.getItem("baraabar_booking_draft_v2"),
    step: localStorage.getItem("baraabar_booking_step_v1"),
  }));
  expect(remaining.draft).toBeNull();
  expect(remaining.step).toBeNull();

  // And refreshing again now starts fresh, since the handoff is gone.
  await page.reload();
  await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
});
