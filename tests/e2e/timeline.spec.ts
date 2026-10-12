import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("wordplay:intro:v1", "seen"));
});

test("renders all timeline entries and follows era navigation", async ({ page }) => {
  await page.goto("/timeline/");
  await expect(page.getByRole("heading", { level: 1, name: "AI, one sentence a year." })).toBeVisible();
  await expect(page.locator(".timeline-entry")).toHaveCount(12);

  const now = page.getByRole("link", { name: "Now", exact: true });
  await now.click();
  await expect(page.locator("#timeline-entry-2022")).toBeInViewport();
  await expect(now).toHaveAttribute("aria-current", "true");

  await page.goto("/timeline/");
  await page.getByRole("link", { name: "Meet Pip →" }).click();
  await expect(page).toHaveURL(/\/modules\/ai-foundations\/lessons\/rules-and-learning\/?$/);
});

test("links from the footer and Explore page", async ({ page }) => {
  await page.goto("/timeline/");
  const footerLink = page.locator("footer").getByRole("link", { name: "Timeline", exact: true });
  await footerLink.scrollIntoViewIfNeeded();
  await expect(footerLink).toHaveAttribute("href", "/timeline/");

  await page.goto("/modules/");
  await expect(page.getByRole("link", { name: /See where it all started: the AI timeline/ })).toHaveAttribute("href", "/timeline/");
});

test("fits a 360px viewport without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/timeline/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("reduced motion keeps every timeline entry visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/timeline/");
  await expect(page.locator(".timeline-entry")).toHaveCount(12);
  for (const entry of await page.locator(".timeline-entry").all()) await expect(entry).toBeVisible();
});
