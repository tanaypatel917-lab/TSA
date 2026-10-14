import { expect, test } from "@playwright/test";
import { WORD_MAP_GROUPS } from "../../src/content/wordMap";

test("Word Map selects related terms through its SVG fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem("wordplay:intro:v1", "seen"));
  await page.goto("/glossary/");
  await page.locator(".glossary-mode label").filter({ hasText: "Word map" }).click();

  await expect(page.locator(".word-map-fallback")).toBeVisible();
  await expect(page.locator(".word-map-detail h3")).toHaveText("Token");
  await expect(page.getByRole("button", { name: "Token", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".word-map-nearest")).toContainText("Nearest:");

  await page.getByRole("button", { name: "Hallucination", exact: true }).click();
  await expect(page.locator(".word-map-detail h3")).toHaveText("Hallucination");
  await expect(page.locator(".word-map-definition")).toContainText("plausible-sounding but unsupported or invented");
  const risks = new Set<string>(WORD_MAP_GROUPS.find((group) => group.id === "risks")!.terms);
  const nearestButtons = page.locator(".word-map-nearest button");
  const neighbors = await nearestButtons.allTextContents();
  const riskNeighbor = neighbors.find((term) => risks.has(term));
  expect(riskNeighbor).toBeTruthy();
  await page.locator(".word-map-nearest").getByRole("button", { name: riskNeighbor!, exact: true }).click();
  await expect(page.locator(".word-map-detail h3")).toHaveText(riskNeighbor!);

  await page.setViewportSize({ width: 320, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  await page.getByRole("link", { name: new RegExp(`Find ${riskNeighbor} in Browse`) }).click();
  await expect(page.getByRole("radio", { name: "Browse" })).toBeChecked();
  await expect(page).toHaveURL(new RegExp(`#term-${riskNeighbor!.toLowerCase().replace(/[^a-z0-9]+/g, "-")}$`));
});
