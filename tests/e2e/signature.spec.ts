import { expect, test, type Page } from "@playwright/test";
import { modules } from "../../src/content";
import { glossary } from "../../src/content/glossary";
import { foundations } from "../../src/content/modules/foundations";
import { overallProgress } from "../../src/engine/chapters";
import { lessonTerms } from "../../src/engine/glossary";
import { initialState, type ProgressState } from "../../src/engine/progress";

const progressKey = "wordplay:progress:v1";
const introKey = "wordplay:intro:v1";
const draftKey = "wordplay:drafts:v1";
const returning: ProgressState = {
  ...initialState,
  xp: 150,
  completedLessons: [...foundations.lessons.map((lesson) => `foundations/${lesson.id}`), "tools/prompt-anatomy", "tools/iterate-verify"],
  completedActivities: ["foundations"],
  quizBest: { foundations: 80 },
  badges: ["first-steps", "module-foundations"],
  streak: { count: 2, lastDay: "2026-09-22" },
  startedAt: "2026-09-20T12:00:00.000Z"
};

async function seed(page: Page, state?: ProgressState, extra: Record<string, string> = {}) {
  await page.addInitScript(({ intro, progress, saved, other }) => {
    localStorage.setItem(intro, "2026-09-22T12:00:00.000Z");
    if (saved) localStorage.setItem(progress, JSON.stringify(saved));
    for (const [key, value] of Object.entries(other)) localStorage.setItem(key, value);
  }, { intro: introKey, progress: progressKey, saved: state, other: extra });
}

test("My learning fills the question mark and maps every step of every chapter", async ({ page }) => {
  await seed(page, returning);
  await page.goto("/learn/");
  const percent = overallProgress(returning, modules);
  await expect(page.locator(".question-meter figcaption")).toContainText(`${percent}%`);
  await expect(page.locator(".question-meter")).toHaveAttribute("style", new RegExp(`--fill: ?${percent}`));
  await expect(page.locator(".map-step")).toHaveCount(modules.reduce((total, module) => total + module.lessons.length + 2, 0));
  await expect(page.locator('.map-step[data-done="true"]')).toHaveCount(returning.completedLessons.length + 2);
  const next = page.locator('.map-step[data-next="true"]');
  await expect(next).toHaveCount(1);
  await expect(next).toHaveAccessibleName("Lesson 3: AI as a study partner, up next");
  await next.hover();
  await expect(page.locator(".map-caption")).toContainText("AI as a study partner");
  await expect(page.getByRole("heading", { name: "Your progress, in your hands." })).toBeVisible();
});

test("the course spine sizes lessons by reading time and fills what you have read", async ({ page }) => {
  await seed(page, returning);
  await page.goto("/modules/");
  await expect(page.locator(".spine-block")).toHaveCount(modules.reduce((total, module) => total + module.lessons.length, 0));
  await expect(page.locator('.spine-block[data-read="true"]')).toHaveCount(returning.completedLessons.length);
  await expect(page.locator(".spine-intro")).toContainText(`You have read ${returning.completedLessons.length} of 22.`);
  const block = page.getByRole("link", { name: "How language models predict text, Chapter 1, lesson 3, 8 min, read" });
  await block.hover();
  await expect(page.locator(".spine-caption")).toContainText("How language models predict text");
  await block.click();
  await expect(page).toHaveURL(/\/lessons\/language-models\/$/);
});

test("a chapter route marks the next station and links its key terms into the glossary", async ({ page }) => {
  await seed(page, returning);
  await page.goto("/modules/ai-tools/");
  await expect(page.locator('.program-route > li[data-done="true"]')).toHaveCount(2);
  await expect(page.locator('.program-route > li[data-next="true"]')).toContainText("AI as a study partner");
  const chip = page.locator(".chapter-terms").getByRole("link", { name: "Prompt", exact: true });
  await expect(chip).toHaveAttribute("href", /\/glossary\/#term-prompt$/);
  await chip.click();
  await expect(page).toHaveURL(/\/glossary\/#term-prompt$/);
  await expect(page.locator("#term-prompt")).toBeInViewport();
});

test("glossary terms in a lesson explain themselves on hover and focus", async ({ page }) => {
  await seed(page);
  const lesson = foundations.lessons.find((item) => item.id === "language-models")!;
  await page.goto(`/modules/${foundations.slug}/lessons/${lesson.id}/`);
  await expect(page.locator(".term-trigger")).toHaveCount(lessonTerms(lesson.body, glossary).length);
  await expect(page.locator(".reading-progress")).toHaveCount(1);
  const token = page.locator(".term-trigger", { hasText: /^tokens?$/i }).first();
  await token.focus();
  const card = page.locator(".term-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText(glossary.find((entry) => entry.term === "Token")!.definition);
  await expect(token).toHaveAccessibleDescription(/^Token: A small piece of text/);
  await page.keyboard.press("Escape");
  await expect(card).toHaveCount(0);
  await expect(page.locator(".outline-terms").getByRole("link", { name: "Token", exact: true })).toHaveAttribute("href", /#term-token$/);
});

test("study cards flip, keep score and let you review the terms you missed", async ({ page }) => {
  await seed(page);
  await page.goto("/glossary/");
  await page.locator(".choice", { hasText: "Study cards" }).click();
  await expect(page.getByText(`Card 1 of ${glossary.length}`)).toBeVisible();
  await page.getByRole("button", { name: "Show definition" }).click();
  await expect(page.locator(".flashcard")).toHaveAttribute("data-revealed", "true");
  await expect(page.getByRole("button", { name: "I knew it" })).toBeFocused();
  await page.getByRole("button", { name: "Not yet" }).click();
  await expect(page.getByText(`Card 2 of ${glossary.length}`)).toBeVisible();
  await expect(page.getByText("0 known, 1 to review")).toBeVisible();
  await expect(page.getByRole("button", { name: "Show definition" })).toBeFocused();
  await page.getByLabel("Search the glossary").fill("token");
  await expect(page.getByText("Card 1 of 1")).toBeVisible();
  await page.getByRole("button", { name: "Show definition" }).click();
  await page.getByRole("button", { name: "I knew it" }).click();
  await expect(page.getByRole("heading", { name: "You knew 1 of 1." })).toBeFocused();
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(page.getByText("Card 1 of 1")).toBeVisible();
});

test("locked badges show how close you are and the closest one is marked", async ({ page }) => {
  await seed(page, returning);
  await page.goto("/badges/");
  await expect(page.locator(".badge-patch", { hasText: "Tool Tinkerer" }).locator(".badge-progress")).toContainText("2 of 7 steps done");
  await expect(page.locator(".badge-closest")).toHaveCount(1);
  await expect(page.locator('.badge-patch[data-closest="true"]')).toContainText("Myth Buster");
  await expect(page.locator(".badge-patch", { hasText: "Foundation Builder" }).locator(".badge-progress")).toHaveCount(0);
});

test("About shows exactly what this browser holds and can clear it", async ({ page }) => {
  await seed(page, returning, { [draftKey]: JSON.stringify({ version: 1, activities: { "tools/prompt-lab": "Act as a tutor" } }) });
  await page.goto("/about/");
  const rows = page.locator(".device-rows li");
  await expect(rows.filter({ hasText: "Learning progress" })).toContainText("7 lessons, 1 activity, 1 quiz score, 150 XP");
  await expect(rows.filter({ hasText: "Prompt drafts" })).toContainText("1 draft, 14 characters");
  await expect(rows.filter({ hasText: "Intro seen" })).toContainText("Seen on Sep 22, 2026");
  await page.getByText("Show the raw data").click();
  await expect(page.locator(".device-raw pre")).toContainText('"completedLessons"');
  await page.getByRole("button", { name: "Clear everything" }).click();
  await page.getByRole("button", { name: "Yes, clear everything" }).click();
  await expect(page.locator(".device-message")).toContainText("Cleared.");
  await expect(rows.filter({ hasText: "Learning progress" })).toContainText("0 lessons, 0 activities, 0 quiz scores, 0 XP");
  await expect(rows.filter({ hasText: "Prompt drafts" })).toContainText("Nothing saved");
  expect(await page.evaluate((keys) => keys.map((key) => localStorage.getItem(key)), [draftKey, introKey, "wordplay:motion:v1"])).toEqual([null, null, null]);
});

test("scroll reveals finish showing content, and reduced motion skips them", async ({ page, browser }) => {
  await seed(page);
  await page.goto("/about/");
  const last = page.locator(".about-principles li").last();
  await expect.poll(() => last.evaluate((element) => element.getAnimations().length)).toBe(2);
  await last.scrollIntoViewIfNeeded();
  await expect.poll(() => last.evaluate((element) => element.getAnimations().length)).toBe(0);
  expect(await last.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const still = await context.newPage();
  await still.addInitScript((key) => localStorage.setItem(key, "seen"), introKey);
  await still.goto("/about/");
  await expect(still.locator("html")).toHaveAttribute("data-motion", "reduced");
  expect(await still.locator(".about-principles li").last().evaluate((element) => element.getAnimations().length)).toBe(0);
  await context.close();
});
