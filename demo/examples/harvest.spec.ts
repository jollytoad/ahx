import { expect, test } from "@playwright/test";

test("Harvest data into forms", async ({ page }) => {
  await page.goto("/examples/harvest.html");
  await page.getByTestId("harvest").click();

  await test.step("rule: input append", async () => {
    const inputs = page.getByTestId("rule-input-append").locator("input");

    await expect(inputs).toHaveCount(3);
    await expect(inputs.nth(0)).toHaveValue("one");
    await expect(inputs.nth(1)).toHaveValue("two");
    await expect(inputs.nth(2)).toHaveValue("three");
  });

  await test.step("rule: input join", async () => {
    const input = page.getByTestId("rule-input-join").locator("input");
    await expect(input).toHaveValue("one two three");
  });

  await test.step("rule: attr include", async () => {
    const target = page.getByTestId("rule-attr-include");
    await expect(target).toHaveAttribute("data-ids", "one two three");
  });

  await test.step("inline: input append", async () => {
    const inputs = page.getByTestId("inline-input-append").locator("input");

    await expect(inputs).toHaveCount(3);
    await expect(inputs.nth(0)).toHaveValue("one");
    await expect(inputs.nth(1)).toHaveValue("two");
    await expect(inputs.nth(2)).toHaveValue("three");
  });
});
