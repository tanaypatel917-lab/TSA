import { expect, test } from "@playwright/test";

test("collects a glossary token, reveals its album slot, and shows the 404 token", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("wordplay:intro:v1", "seen");
  });

  await page.goto("/glossary/");
  await page.getByRole("button", { name: "Lost token ##ing. Collect it." }).click();
  const popover = page.locator(".lost-token-popover");
  await expect(popover).toContainText("Found 1 of 6");
  await expect(popover).toContainText("##ing");

  await page.goto("/badges/");
  await expect(page.locator(".lost-token-count")).toHaveText("1 / 6 found");
  const revealed = page.locator('.lost-token-slot[data-found="true"]').filter({ hasText: "##ing" });
  await expect(revealed).toContainText("A subword piece. Tokenizers split rare words into common chunks like this one.");

  await page.goto("/does-not-exist/");
  await expect(page.getByRole("button", { name: "Lost token <eos>. Collect it." })).toBeVisible();
});
