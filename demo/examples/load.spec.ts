import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/load.html");
});

test("load via rule", async ({ page }) => {
  const target = page.locator(".load-via-rule .loaded");
  await expect(target).toBeVisible();
});

test("load via nested rule", async ({ page }) => {
  const target = page.locator(".load-via-nested-rule .loaded");
  await expect(target).toBeVisible();
});

test("load via attr", async ({ page }) => {
  const target = page.locator(".load-via-attr .loaded");
  await expect(target).toBeVisible();
});
