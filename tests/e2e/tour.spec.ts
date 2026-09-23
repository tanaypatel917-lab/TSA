import { expect, test } from "@playwright/test";
import { tourStops } from "../../src/content/tour";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("wordplay:intro:v1", "seen"));
});

test("the site tour walks judges through the best features and survives a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Take the 2-minute tour/ }).click();
  const first = page.getByRole("complementary", { name: tourStops[0].title });
  await expect(first).toContainText(`Stop 1 of ${tourStops.length}`);
  await expect(first.getByRole("heading", { level: 2 })).toBeFocused();
  await expect(page.locator(".home-hero h1")).toHaveAttribute("data-tour", "on");
  await first.getByRole("button", { name: /Next stop/ }).click();
  await expect(page).toHaveURL(/\/modules\/$/);
  const second = page.getByRole("complementary", { name: tourStops[1].title });
  await expect(second).toBeVisible();
  await expect(page.locator(".spine")).toHaveAttribute("data-tour", "on");
  await page.reload();
  await expect(page.getByRole("complementary", { name: tourStops[1].title })).toBeVisible();
  await page.goto("/glossary/");
  const away = page.getByRole("complementary", { name: tourStops[1].title });
  await expect(away).toContainText("You left the tour route");
  await away.getByRole("button", { name: /Go to this stop/ }).click();
  await expect(page).toHaveURL(/\/modules\/$/);
  await page.getByRole("button", { name: "End the tour" }).click();
  await expect(page.locator(".tour-card")).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("wordplay:tour:v1"))).toBeNull();
});

test("the last stop finishes the tour on About, which explains how the site was built", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByRole("heading", { level: 2, name: "How we built it." })).toBeVisible();
  await expect(page.locator(".built-steps li")).toHaveCount(4);
  await page.evaluate((last) => sessionStorage.setItem("wordplay:tour:v1", String(last)), tourStops.length - 1);
  await page.reload();
  const card = page.getByRole("complementary", { name: tourStops[tourStops.length - 1].title });
  await expect(card).toContainText(`Stop ${tourStops.length} of ${tourStops.length}`);
  await card.getByRole("button", { name: /Finish tour/ }).click();
  await expect(page.locator(".tour-card")).toHaveCount(0);
});

test("References documents credits with a copyright checklist", async ({ page }) => {
  await page.goto("/references/");
  const checklist = page.locator(".copyright-check");
  await expect(checklist.getByRole("heading", { name: "Copyright checklist" })).toBeVisible();
  await expect(checklist.locator("dt")).toHaveCount(5);
  await expect(page.locator("#references-credits")).toContainText("Spline runtime");
  await expect(page.locator("#references-credits")).toContainText("Lessons, quizzes and activities");
});
