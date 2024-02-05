import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/test/chatbot.html");
});

test("chatbot", async ({ page }) => {
  const startButton = page.getByText("Start", { exact: true });
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

  // check that done is not inside .msg
  await expect(msg.getByTestId("done")).toHaveCount(0, { timeout: 1 });

  await expect(control).toContainText("Retry", { timeout: 1 });
  await expect(control).not.toContainText("Stop", { timeout: 1 });

  await expect(blahs).toHaveCount(20, { timeout: 1 });
});
