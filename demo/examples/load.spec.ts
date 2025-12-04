import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/load.html");
});

test("on-ready", async ({ page }) => {
  await page.goto("/examples/load.html");

  await test.step("load via rule", async () => {
    const target = page.locator(".load-via-rule .loaded");
    await expect(target).toBeVisible();
  });

  await test.step("load via attr", async () => {
    const target = page.locator(".load-via-attr .loaded");
    await expect(target).toBeVisible();
  });

  // NOTE: nested CSS is not yet supported
  await test.step.skip("load via nested rule", async () => {
    const target = page.locator(".load-via-nested-rule .loaded");
    await expect(target).toBeVisible();
  });
});
