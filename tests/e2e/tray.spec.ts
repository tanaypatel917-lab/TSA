import { expect, test } from "@playwright/test";

const TRAY_KEY = "wordplay:tray:v1";
const INTRO_KEY = "wordplay:intro:v1";

async function seedTray(page: import("@playwright/test").Page, terms: string[]) {
  await page.addInitScript(({ key, savedTerms }) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, terms: savedTerms }));
  }, { key: TRAY_KEY, savedTerms: terms });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "seen"), INTRO_KEY);
});

test("glossary saves words in order, removes one, and keeps the change after reload", async ({ page }) => {
  await page.goto("/glossary/");
  const token = page.getByRole("button", { name: "Save Token to your word tray" });
  const model = page.getByRole("button", { name: "Save Model to your word tray" });
  await expect(token).toBeEnabled();
  await token.click();
  await expect(page.getByRole("link", { name: "Word tray, 1 saved" })).toBeVisible();
  await model.click();
  await expect(page.getByRole("link", { name: "Word tray, 2 saved" })).toBeVisible();

  await page.goto("/tray/");
  await expect(page.locator(".tray-term h2")).toHaveText(["Token", "Model"]);
  await page.getByRole("button", { name: "Remove Model" }).click();
  await expect(page.locator(".tray-status")).toHaveText("1 words saved");
  await page.reload();
  await expect(page.locator(".tray-term h2")).toHaveText(["Token"]);
  await expect(page.getByRole("link", { name: "Word tray, 1 saved" })).toBeVisible();
});

test("a lesson sidebar key saves its term to the tray", async ({ page }) => {
  await page.goto("/modules/ai-foundations/lessons/strengths-and-limits/");
  const toggle = page.locator(".outline-terms").getByRole("button").first();
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText("+");
  const name = await toggle.getAttribute("aria-label");
  const term = name?.replace(/^Save /, "").replace(/ to your word tray$/, "");
  expect(term).toBeTruthy();
  await toggle.click();
  await expect(toggle).toHaveText("✓");
  await expect(page.getByRole("link", { name: "Word tray, 1 saved" })).toBeVisible();
  await page.goto("/tray/");
  await expect(page.locator(".tray-term h2")).toHaveText([term!]);
});

test("clear tray requires a second click", async ({ page }) => {
  await page.goto("/glossary/");
  await page.getByRole("button", { name: "Save Token to your word tray" }).click();
  await page.goto("/tray/");
  const clear = page.getByRole("button", { name: "Clear tray" });
  await clear.click();
  await expect(page.getByRole("button", { name: "Click again to clear" })).toBeVisible();
  await expect(page.locator(".tray-term h2")).toHaveText(["Token"]);
  await page.getByRole("button", { name: "Click again to clear" }).click();
  await expect(page.locator(".tray-status")).toHaveText("0 words saved");
  await expect(page.getByText("Your tray is empty.")).toBeVisible();
});

test("print mode hides the site header and shows the study-sheet footer", async ({ page }) => {
  await seedTray(page, ["Token", "Model", "Prompt"]);
  await page.goto("/tray/");
  await expect(page.locator(".tray-term h2")).toHaveText(["Token", "Model", "Prompt"]);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.getByRole("heading", { name: "My AI study sheet" })).toBeVisible();
  await expect(page.getByText("PROPERTY OF A CURIOUS STUDENT // STORED IN THIS BROWSER ONLY")).toBeVisible();
});

test("keyboard activation saves a glossary word", async ({ page }) => {
  await page.goto("/glossary/");
  const token = page.getByRole("button", { name: "Save Token to your word tray" });
  await expect(token).toBeEnabled();
  let focused = false;
  for (let index = 0; index < 80; index += 1) {
    await page.keyboard.press("Tab");
    const label = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    if (label === "Save Token to your word tray") {
      focused = true;
      break;
    }
  }
  expect(focused).toBe(true);
  await page.keyboard.press("Space");
  await expect(token).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "Word tray, 1 saved" })).toBeVisible();
});

test("the tray stays within a 360px viewport", async ({ page }) => {
  await seedTray(page, ["Machine learning", "Generative AI", "Prompt injection"]);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/tray/");
  await expect(page.locator(".tray-term h2")).toHaveCount(3);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("a fresh browser has an empty tray and About describes saved words as local", async ({ page }) => {
  await page.goto("/tray/");
  await expect(page.getByText("Your tray is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Word tray, 0 saved" })).toBeVisible();
  await page.goto("/about/");
  await expect(page.getByText(/Progress, prompt drafts and saved words stay in this browser/)).toBeVisible();
});

test("tray changes synchronize with another open tab", async ({ page }) => {
  const other = await page.context().newPage();
  await other.addInitScript((key) => localStorage.setItem(key, "seen"), INTRO_KEY);
  await page.goto("/glossary/");
  await other.goto("/glossary/");
  await expect(other.getByRole("link", { name: "Word tray, 0 saved" })).toBeVisible();
  await page.getByRole("button", { name: "Save Token to your word tray" }).click();
  await expect(other.getByRole("link", { name: "Word tray, 1 saved" })).toBeVisible();
  await other.close();
});

test("the 768px header menu keeps its tray link accessible without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole("link", { name: "Word tray, 0 saved" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});

test("the desktop header remains on one row at 1024 and 1280 pixels", async ({ page }) => {
  await page.goto("/tray/");
  for (const width of [1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await page.evaluate(() => {
      const shell = document.querySelector(".nav-shell")!.getBoundingClientRect();
      const brand = document.querySelector(".brand")!.getBoundingClientRect();
      const navigation = document.querySelector(".site-navigation")!.getBoundingClientRect();
      return {
        shellLeft: shell.left,
        shellRight: shell.right,
        brandRight: brand.right,
        navigationLeft: navigation.left,
        navigationRight: navigation.right,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    expect(geometry.navigationLeft).toBeGreaterThan(geometry.brandRight);
    expect(geometry.navigationRight).toBeLessThanOrEqual(geometry.shellRight + 1);
    expect(geometry.brandRight).toBeGreaterThan(geometry.shellLeft);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
  }
});
