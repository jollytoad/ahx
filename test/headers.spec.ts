import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/test/headers.html");
});

test("load with headers", async ({ page }) => {
  const requestPromise = page.waitForRequest(/loaded.html$/);

  await page.getByText("Load").click();

  const target = page.getByText("LOADED");
  await expect(target).toBeVisible();

  const request = await requestPromise;

  expect(await request.headerValue("x-custom-header")).toBe("foo");
});
