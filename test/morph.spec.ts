import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/test/morph.html");
});

test("video continues to play", async ({ page }) => {
  const heading = page.locator("h3");
  const frame = page.frameLocator("#video");
  const video = frame.locator("video");
  const playButton = frame.getByLabel("Play", { exact: true });
  const morphButton = page.getByText("Morph", { exact: true });

  // Ensure the initial content has loaded
  await expect(heading).toContainText("Above");

  // Expect video to not be playing
  await expect(video).toHaveJSProperty("paused", true);

  await playButton.click();

  // Expect video to now be playing
  await expect(video).toHaveJSProperty("paused", false);

  await morphButton.click();

  // Ensure new content has loaded
  await expect(heading).toContainText("Below");

  // Expect video to still be playing
  await expect(video).toHaveJSProperty("paused", false);
});

test("input value is retained", async ({ page }) => {
  const heading = page.locator("h3");
  const input = page.locator("#input");
  const morphButton = page.getByText("Morph", { exact: true });

  // Ensure the initial content has loaded
  await expect(heading).toContainText("Above");

  await expect(input).toHaveValue("");

  await input.fill("Rickrolled");

  await expect(input).toHaveValue("Rickrolled");

  await morphButton.click();

  // Ensure new content has loaded
  await expect(heading).toContainText("Below");

  // Expect user entered value to be retained
  await expect(input).toHaveValue("Rickrolled");
});
