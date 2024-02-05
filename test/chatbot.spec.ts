import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/test/chatbot.html");
});

test("chatbot", async ({ page }) => {
  const startButton = page.getByText("Start", { exact: true });
  const target = page.getByTestId("target");
  const msg = page.getByTestId("msg");
  const control = page.getByTestId("control");
  const content = page.getByTestId("content");
  const done = page.getByTestId("done");
  const blahs = page.getByText("blah");

  await startButton.click();

  await expect(msg).toBeVisible();

  await expect(control).toContainText("Stop");

  await expect(content).toContainText("blah");

  await expect(done).toBeVisible();

  // check that done is inside #target
  await expect(target.filter({ has: done })).toHaveCount(1, { timeout: 1 });
  // but NOT inside .msg (ie. ahx-target has reset the target)
  await expect(msg.filter({ hasNot: done })).toHaveCount(1, { timeout: 1 });

  await expect(control).toContainText("Retry", { timeout: 1 });
  await expect(control).not.toContainText("Stop", { timeout: 1 });

  await expect(blahs).toHaveCount(20, { timeout: 1 });
});
