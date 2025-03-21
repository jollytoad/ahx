import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/harvest.html");
});

test("input append", async ({ page }) => {
  const inputs = page.locator(".target1 input");

  await expect(inputs).toHaveCount(3);
  await expect(inputs.nth(0)).toHaveValue("one");
  await expect(inputs.nth(1)).toHaveValue("two");
  await expect(inputs.nth(2)).toHaveValue("three");
});

test("input join", async ({ page }) => {
  const input = page.locator(".target2 input");
  await expect(input).toHaveValue("one two three");
});

test("attr join", async ({ page }) => {
  const target = page.locator(".target3");
  await expect(target).toHaveAttribute("ahx-data-ids", "one two three");
});
