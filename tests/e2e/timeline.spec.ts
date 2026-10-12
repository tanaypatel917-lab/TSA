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

test("keeps phone era navigation full-bleed and clears the header on anchor jumps", async ({ page }) => {
  await page.addInitScript(() => document.documentElement.style.setProperty("scroll-behavior", "auto", "important"));
  for (const width of [360, 390, 767]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/timeline/");
    await page.getByRole("link", { name: "Now", exact: true }).click();
    await expect(page).toHaveURL(/#now$/);
    await expect(page.locator("#now")).toBeInViewport();
    await page.waitForFunction(() => document.querySelector(".timeline-nav-wrap")?.getBoundingClientRect().top === 0);
    const layout = await page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>(".timeline-nav-wrap");
      const header = document.querySelector<HTMLElement>(".site-header");
      const section = document.querySelector<HTMLElement>("#now");
      const barRect = bar!.getBoundingClientRect();
      const styles = getComputedStyle(bar!);
      return {
        left: barRect.left,
        width: barRect.width,
        top: barRect.top,
        bottom: barRect.bottom,
        background: styles.backgroundColor,
        border: styles.borderBottomColor,
        headerBottom: header!.getBoundingClientRect().bottom,
        sectionTop: section!.getBoundingClientRect().top,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth
      };
    });
    expect(layout.left).toBe(0);
    expect(layout.width).toBe(width);
    expect(layout.top).toBe(0);
    expect(layout.background).toBe("rgb(246, 239, 229)");
    expect(layout.border).toBe("rgb(210, 200, 188)");
    expect(layout.sectionTop).toBeGreaterThanOrEqual(Math.max(layout.headerBottom, layout.bottom) - 1);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
  }
});

test("reduced motion keeps every timeline entry visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/timeline/");
  await expect(page.locator(".timeline-entry")).toHaveCount(12);
  for (const entry of await page.locator(".timeline-entry").all()) await expect(entry).toBeVisible();
});
