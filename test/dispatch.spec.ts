import { expect, test } from "@playwright/test";

test("event dispatched", async ({ page }) => {
  await page.goto("/test/dispatch.html");

  const eventPromise = page.evaluate(() => {
    return new Promise((f) => {
      document.addEventListener("load-me-now", (event) => {
        f(event.type);
      }, { once: true });
    });
  });

  await page.locator("#button").click();

  const dispatched = await eventPromise;

  expect(dispatched).toBe("load-me-now");

  const target = page.locator("#target .loaded");
  await expect(target).toBeVisible();
});
