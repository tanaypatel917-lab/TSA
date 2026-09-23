import { expect, test, type Page } from "@playwright/test";
import { modules } from "../../src/content";
import { glossary } from "../../src/content/glossary";
import { foundations } from "../../src/content/modules/foundations";
import { referenceGroups, referencesForLesson } from "../../src/content/references";
import { BADGES } from "../../src/engine/badges";
import { initialState, type ProgressState } from "../../src/engine/progress";

const progressKey = "wordplay:progress:v1";
const introKey = "wordplay:intro:v1";
const returning: ProgressState = {
  ...initialState,
  xp: 150,
  completedLessons: [...foundations.lessons.map((lesson) => `foundations/${lesson.id}`), "tools/prompt-anatomy"],
  completedActivities: ["foundations"],
  quizBest: { foundations: 80 },
  badges: ["first-steps", "module-foundations"],
  streak: { count: 1, lastDay: "2026-09-22" },
  startedAt: "2026-09-22T12:00:00.000Z"
};

async function seed(page: Page, state?: ProgressState) {
  await page.addInitScript(({ intro, progress, saved }) => {
    localStorage.setItem(intro, "seen");
    if (saved) localStorage.setItem(progress, JSON.stringify(saved));
  }, { intro: introKey, progress: progressKey, saved: state });
}

test("Explore lists every chapter as one link with live progress", async ({ page }) => {
  await seed(page, returning);
  await page.goto("/modules/");
  await expect(page.getByRole("heading", { level: 1, name: "Five questions worth asking." })).toBeVisible();
  const rows = page.locator(".chapter-row");
  await expect(rows).toHaveCount(modules.length);
  await expect(rows.nth(0).locator(".chapter-status")).toHaveText("Complete");
  await expect(rows.nth(1).locator(".chapter-status")).toHaveText("1 of 5 lessons read");
  await expect(rows.nth(2).locator(".chapter-status")).toHaveText("Not started");
  await rows.nth(1).click();
  await expect(page).toHaveURL(/\/modules\/ai-tools\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "What should you ask?" })).toBeVisible();
});

test("a chapter overview starts new learners at lesson one", async ({ page }) => {
  await seed(page);
  await page.goto("/modules/ai-tools/");
  await expect(page.getByRole("link", { name: "Start lesson 1" })).toHaveAttribute("href", /\/modules\/ai-tools\/lessons\/prompt-anatomy\/?$/);
  await expect(page.locator(".program-step")).toHaveCount(7);
  await expect(page.locator(".program-step .step-state")).toHaveText(["Lesson", "Lesson", "Lesson", "Lesson", "Lesson", "Practice", "Quiz"]);
});

test("a chapter overview resumes returning learners and marks finished chapters", async ({ page }) => {
  await seed(page, returning);
  await page.goto("/modules/ai-tools/");
  await expect(page.getByRole("link", { name: "Continue" })).toHaveAttribute("href", /\/modules\/ai-tools\/lessons\/iterate-verify\/?$/);
  await expect(page.getByText("Up next: Lesson 2: Iterate and verify")).toBeVisible();
  await expect(page.locator(".program-step").first()).toHaveAttribute("data-done", "true");
  await page.goto("/modules/ai-foundations/");
  await expect(page.getByRole("link", { name: "Review the chapter" })).toBeVisible();
  await expect(page.getByText("Chapter complete. Best quiz score: 80%.")).toBeVisible();
  await expect(page.locator(".program-step .step-state").last()).toHaveText("Best 80%");
});

test("glossary search filters terms, announces the count and recovers from no results", async ({ page }) => {
  await seed(page);
  await page.goto("/glossary/");
  const count = page.locator("#glossary-count");
  const search = page.getByLabel("Search the glossary");
  const matches = glossary.filter((entry) => entry.term.toLowerCase().includes("token") || entry.definition.toLowerCase().includes("token"));
  await expect(count).toHaveText(`${glossary.length} terms`);
  await search.fill("token");
  await expect(count).toHaveText(`${matches.length} of ${glossary.length} terms`);
  await expect(page.getByRole("term")).toHaveCount(matches.length);
  await expect(page.getByRole("link", { name: "How language models predict text" })).toBeVisible();
  await search.fill("zzz");
  await expect(page.getByText("No terms match “zzz”.")).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(count).toHaveText(`${glossary.length} terms`);
  await expect(page.getByRole("term")).toHaveCount(glossary.length);
  await page.getByRole("navigation", { name: "Jump to a letter" }).getByRole("link", { name: "T", exact: true }).click();
  await expect(page).toHaveURL(/#glossary-T$/);
});

test("lessons cite their sources and References numbers every source with a secure link", async ({ page }) => {
  await seed(page);
  await page.goto(`/modules/${foundations.slug}/lessons/data-and-bias/`);
  const sources = page.getByRole("region", { name: "Sources" });
  await expect(sources.getByRole("listitem")).toHaveCount(referencesForLesson("foundations", "data-and-bias").length);
  await sources.getByRole("link", { name: "All references" }).click();
  await expect(page).toHaveURL(/\/references\/$/);
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "References" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".reference-item")).toHaveCount(referenceGroups.reduce((total, group) => total + group.references.length, 0));
  const hrefs = await page.locator(".reference-title a").evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(hrefs.every((href) => href.startsWith("https://"))).toBe(true);
  await expect(page.locator("#ref-dastin-2018")).toContainText("Used in Training data and bias.");
  await expect(page.getByRole("heading", { name: "Typefaces, 3D, and software" })).toBeVisible();
});

test("badges describe earned and locked states in words", async ({ page }) => {
  await seed(page, returning);
  await page.goto("/badges/");
  await expect(page.locator(".badge-summary")).toContainText(`of ${BADGES.length} badges earned on this device`);
  await expect(page.locator(".badge-summary strong")).toHaveText("2");
  await expect(page.locator('.badge-patch[data-earned="true"]')).toHaveCount(2);
  await expect(page.locator(".badge-patch").filter({ hasText: "Foundation Builder" }).locator(".badge-state")).toHaveText("Earned");
  await expect(page.locator(".badge-patch").filter({ hasText: "AI Ally" }).locator(".badge-state")).toHaveText("Locked");
});

test("unknown routes show the designed 404 with recovery links", async ({ page }) => {
  await seed(page);
  const response = await page.goto("/not-a-real-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "That question has no page yet." })).toBeVisible();
  await page.getByRole("link", { name: "Explore lessons" }).click();
  await expect(page).toHaveURL(/\/modules\/$/);
});

test("the sorting activity keeps keyboard focus, reports each answer and completes once", async ({ page }) => {
  const activity = foundations.activity;
  if (activity.kind !== "classifier") throw new Error("AI Foundations should use the classifier activity");
  await seed(page);
  await page.goto(`/modules/${foundations.slug}/activity/`);
  const bins = { spam: page.getByRole("button", { name: /^Spam/ }), "not-spam": page.getByRole("button", { name: /^Not spam/ }) };
  for (const [index, item] of activity.items.entries()) {
    await expect(page.getByText(`Message ${index + 1} of ${activity.items.length}`)).toBeVisible();
    await bins[item.label].focus();
    await page.keyboard.press("Enter");
    if (index < activity.items.length - 1) {
      await expect(page.locator(".activity-feedback")).toContainText("Correct. Nice pattern spotting.");
      await expect(bins[item.label]).toBeFocused();
    }
  }
  await expect(page.getByRole("heading", { name: `${activity.items.length} of ${activity.items.length} sorted correctly.` })).toBeFocused();
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}") as ProgressState, progressKey);
  expect(saved.completedActivities).toEqual(["foundations"]);
  await expect(page.locator("tr", { hasText: "A link to click" }).locator("td")).toHaveText(["2", "0"]);
  await expect(page.locator("tr", { hasText: "Everyday plans" }).locator("td")).toHaveText(["0", "6"]);
  expect(saved.xp).toBe(25);
});

test("scenario feedback names the verdict and moves focus to the next situation", async ({ page }) => {
  await seed(page);
  await page.goto("/modules/ethical-ai/activity/");
  await page.getByRole("button", { name: /Submit the outline silently/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Worth reconsidering." })).toBeVisible();
  await expect(page.getByRole("button", { name: /Add a note explaining/ })).toContainText("Defensible");
  await expect(page.getByRole("button", { name: /Submit the outline silently/ })).toContainText("Reconsider");
  await page.getByRole("button", { name: "Next scenario" }).click();
  await expect(page.getByRole("heading", { level: 2, name: /lower recommendation scores/ })).toBeFocused();
});

test("redesigned pages fit a 390px screen without horizontal scrolling", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript((key) => localStorage.setItem(key, "seen"), introKey);
  const page = await context.newPage();
  for (const path of ["/play/", "/modules/", "/modules/ai-in-the-real-world/", "/badges/", "/glossary/", "/about/", "/references/", "/modules/capstone/activity/", "/modules/ai-in-the-real-world/activity/"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
  }
  await context.close();
});
