import { expect, test, type Page } from "@playwright/test";
import { introActs } from "../../src/content/intro";

const introKey = "wordplay:intro:v1";

async function openIntro(page: Page) {
  await page.goto("/intro/");
  await expect(page.locator(".intro-experience")).toHaveAttribute("data-ready", "true");
}

test("the first-visit gate traps focus, Escape enters Wordplay, and reload bypasses it", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "A question wants to move." });
  const play = page.getByRole("button", { name: "Play the introduction", exact: true });
  const enter = page.getByRole("button", { name: "Enter Wordplay", exact: true });

  await expect(dialog).toBeVisible();
  await expect(page.getByRole("heading", { name: "A question wants to move.", exact: true })).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-intro-gate", "open");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Tab");
  await expect(play).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(enter).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(play).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  expect(await page.evaluate((key) => localStorage.getItem(key), introKey)).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Ask better. Think further.", exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("dialog", { name: "A question wants to move." })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Ask better. Think further.", exact: true })).toBeVisible();
});

test("playing the intro opens the scroll film and Enter returns with persistence", async ({ page }) => {
  const scenes: string[] = [];
  page.on("request", (request) => { if (request.url().includes(".splinecode")) scenes.push(request.url()); });

  await page.goto("/");
  await page.getByRole("button", { name: "Play the introduction", exact: true }).click();
  await expect(page).toHaveURL(/\/intro\/$/);
  await expect(page.locator("html")).toHaveAttribute("data-intro-page", "true");
  await expect(page.getByRole("heading", { level: 1, name: "Follow the question.", exact: true })).toBeVisible();
  for (const act of introActs.slice(1)) await expect(page.getByRole("heading", { name: act.title, exact: true })).toBeAttached();
  expect(await page.locator(".site-header").evaluate((element) => getComputedStyle(element).display)).toBe("none");
  await expect(page.locator(".intro-experience")).toHaveAttribute("data-scene-state", "disabled");
  await expect(page.locator(".glyph-question")).toBeVisible();
  await expect(page.locator(".intro-canvas canvas")).toHaveCount(0);
  expect(scenes).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight * 8)).toBe(true);

  await page.getByRole("link", { name: "Start the tour", exact: true }).click();
  await expect(page).toHaveURL(/#intro-act-1$/);
  await expect(page.getByRole("link", { name: "Questions", exact: true })).toHaveAttribute("aria-current", "step");

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  const enter = page.getByRole("link", { name: "Enter Wordplay", exact: true });
  await expect(enter).toBeVisible();
  await enter.click();
  await expect(page.locator(".intro-wipe")).toHaveAttribute("data-open", "true");
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate((key) => localStorage.getItem(key), introKey)).toBeTruthy();
  expect(await page.locator(".site-header").evaluate((element) => getComputedStyle(element).display)).not.toBe("none");
  await expect(page.getByRole("dialog", { name: "A question wants to move." })).toHaveCount(0);
});

test("chapter index, color tone and still composition follow the scroll position", async ({ page }) => {
  await openIntro(page);
  const index = page.getByRole("navigation", { name: "Introduction chapters" });
  await expect(index.getByRole("link")).toHaveCount(introActs.length);
  await expect(index.getByRole("link", { name: "Start", exact: true })).toHaveAttribute("aria-current", "step");
  await index.getByRole("link", { name: "Proof", exact: true }).click();
  await expect(page).toHaveURL(/#intro-act-4$/);
  await expect(index.getByRole("link", { name: "Proof", exact: true })).toHaveAttribute("aria-current", "step");
  await expect(page.locator(".intro-experience")).toHaveAttribute("data-tone", "light");
  await expect(page.locator(".intro-stage")).toHaveAttribute("data-act", "4");
  await expect(page.locator(".intro-stage")).toHaveCSS("background-color", "rgb(246, 239, 229)");
});

test("your question travels: it is tokenized, lands in the word galaxy, frames the proof scene and picks a starting lesson", async ({ page }) => {
  await openIntro(page);
  await expect(page.getByText("No question yet, so we will follow “Can AI be wrong?” for now. Type your own anytime.", { exact: true })).toBeAttached();
  await page.getByLabel("Your question").fill("Will robots take my job?");
  await expect(page.locator(".act-tokens span")).toHaveText(["Will", "robot", "s", "take", "my", "job", "?"]);
  await expect(page.getByText("7 tokens. That is how a model reads your question. Keep scrolling to follow it.", { exact: true })).toBeAttached();
  const landings = page.locator(".act-landings li");
  await expect(landings).toHaveCount(2);
  await expect(landings.first()).toContainText("robots landed near");
  await page.getByLabel("Drop in any word").fill("pizza");
  await page.getByRole("button", { name: "Drop it in", exact: true }).click();
  await expect(landings).toHaveCount(3);
  await expect(landings.last()).toHaveText("pizza landed near bread, rice and cake.");
  await page.getByLabel("Drop in any word").fill("zorblax");
  await page.keyboard.press("Enter");
  await expect(landings.last()).toHaveText("zorblax is not on this small map, so it floats at the edge.");
  await expect(page.getByText("Before you trust any answer to “Will robots take my job?”, check it like this.", { exact: true })).toBeAttached();
  await page.getByRole("button", { name: "Is it cheating to use AI for homework?", exact: true }).click();
  await expect(page.getByRole("link", { name: "Start with Learning honestly with AI" })).toHaveAttribute("href", "/modules/ethical-ai/lessons/academic-integrity/");
});

test("the prompt, claim and practice scenes respond with text, not only visuals", async ({ page }) => {
  await openIntro(page);

  const parts = page.getByRole("group", { name: "Prompt parts" });
  const format = parts.getByRole("button", { name: "Format", exact: true });
  const prompt = page.locator(".act-prompt p");
  await format.click();
  await expect(format).toHaveAttribute("aria-pressed", "true");
  await expect(prompt).toContainText("Use five numbered steps.");
  await format.click();
  await expect(format).toHaveAttribute("aria-pressed", "false");
  await expect(prompt).not.toContainText("Use five numbered steps.");
  for (const button of await parts.getByRole("button").all()) {
    if ((await button.getAttribute("aria-pressed")) === "false") await button.click();
  }
  await expect(page.getByText("5 of 5 parts. All five parts. Specific enough to be useful.", { exact: true })).toBeVisible();
  await expect(prompt).toHaveText("Act as a biology tutor. Explain photosynthesis. The reader is a grade 10 student who missed the lab. Use five numbered steps. Keep it under 120 words.");

  await page.getByRole("button", { name: "Check the claim", exact: true }).click();
  await expect(page.getByText("Half right, fully confident. The honey part holds up. The Einstein part was invented.", { exact: true })).toBeVisible();
  await expect(page.getByText("No source exists", { exact: true })).toBeVisible();
  await expect(page.locator(".intro-stage")).toHaveAttribute("data-claim", "checked");
  await page.getByRole("button", { name: "Show the claim again", exact: true }).click();
  await expect(page.getByRole("button", { name: "Check the claim", exact: true })).toBeVisible();
  await expect(page.getByText("No source exists", { exact: true })).toHaveCount(0);

  const breakIt = page.getByRole("button", { name: "Break it", exact: true });
  await breakIt.click();
  await breakIt.click();
  await expect(page.getByText("Rebuilt 2 times. That is the loop: test, notice, improve.", { exact: true })).toBeVisible();
});

test("the intro remains keyboard-operable and Skip intro restores navigation", async ({ page }) => {
  await openIntro(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Wordplay.", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip intro", exact: true });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate((key) => localStorage.getItem(key), introKey)).toBeTruthy();
  await expect(page.locator(".site-header")).toBeVisible();
});

test("the mobile still version is readable, does not load a canvas, and exits cleanly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openIntro(page);
  await expect(page.getByRole("heading", { level: 1, name: "Follow the question.", exact: true })).toBeVisible();
  expect(await page.locator(".intro-experience").getAttribute("data-scene-state")).not.toBe("ready");
  await expect(page.locator(".intro-canvas canvas")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Introduction chapters" })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.getByRole("link", { name: "Explore lessons", exact: true }).click();
  await expect(page).toHaveURL(/\/modules\/$/);
  expect(await page.evaluate((key) => localStorage.getItem(key), introKey)).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Five questions worth asking.", exact: true })).toBeVisible();
});

test("reduced motion uses the still composition, exits without the wipe and makes no scene request", async ({ page }) => {
  const scenes: string[] = [];
  page.on("request", (request) => { if (request.url().includes(".splinecode")) scenes.push(request.url()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openIntro(page);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  expect(await page.locator(".intro-experience").getAttribute("data-scene-state")).not.toBe("ready");
  await expect(page.locator(".glyph-question")).toBeVisible();
  await expect(page.locator(".intro-canvas canvas")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const enter = page.getByRole("link", { name: "Enter Wordplay", exact: true });
  await enter.click({ noWaitAfter: true });
  expect(await page.evaluate(() => document.querySelector(".intro-wipe")?.getAttribute("data-open") ?? "gone")).not.toBe("true");
  await expect(page).toHaveURL(/\/$/);
  expect(scenes).toEqual([]);
});

test("without JavaScript every scene is readable on its own color field", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/intro/");
  for (const act of introActs.slice(1)) {
    const heading = page.getByRole("heading", { name: act.title, exact: true });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
  }
  expect(await page.locator("#intro-act-2").evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(74, 104, 146)");
  await context.close();
});
