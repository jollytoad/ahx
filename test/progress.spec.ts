import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/test/progress.html");
});

test("progress", async ({ page }) => {
  const startButton = page.getByText("Start", { exact: true });
  const progressBar = page.getByRole("progressbar");
  const complete = page.getByText("Complete!", { exact: true });

  await startButton.click();

  await expect(progressBar).toBeVisible();

  await expect(complete).toBeVisible();

  await expect(progressBar).toHaveCount(1, { timeout: 1 });
  await expect(progressBar).toHaveText("100%", { timeout: 1 });
});
