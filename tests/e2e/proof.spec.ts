import { expect, test } from "@playwright/test";
import { foundations } from "../../src/content/modules/foundations";
import { initialState } from "../../src/engine/progress";

const progressKey = "wordplay:progress:v1";
const draftKey = "wordplay:drafts:v1";
const introKey = "wordplay:intro:v1";
const promptPath = "/modules/ai-tools/activity/";
const lesson = foundations.lessons.find((item) => item.id === "data-and-bias")!;
const lessonPath = `/modules/${foundations.slug}/lessons/${lesson.id}/`;
const prompt = "Act as a science teacher. Explain climate change to a grade 10 student in a table. Cite sources and use simple words.";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "seen"), introKey);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`public proof fits ${viewport.width}×${viewport.height} with scene disabled`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    const scenes: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => { if (request.url().includes(".splinecode")) scenes.push(request.url()); });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Ask better. Think further." })).toBeVisible();
    const action = page.getByRole("link", { name: "Explore lessons", exact: true }).first();
    const box = await action.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThan(viewport.height);
    await expect(page.locator(".scene-viewport")).toHaveAttribute("data-scene-state", "disabled");
    await expect(page.locator(".scene-canvas canvas")).toHaveCount(0);
    await expect(page.locator(".module-poster")).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    expect(scenes).toEqual([]);
  });
}

test("lesson remains readable and navigable at 200% zoom", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  await context.addInitScript((key) => localStorage.setItem(key, "seen"), introKey);
  const page = await context.newPage();
  await page.goto(lessonPath);
  await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Mark complete & continue", exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Mark complete & continue", exact: true })).toBeVisible();
  await context.close();
});

test("mobile menu supports keyboard links, Escape and focus return", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Explore", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.getByRole("link", { name: "My learning", exact: true }).click();
  await expect(page).toHaveURL(/\/learn\/$/);
  await expect(page.getByRole("heading", { name: "Your next good question." })).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("the complete lesson preserves content, mobile outline and completion identity", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(lessonPath);
  for (const paragraph of lesson.body) await expect(page.getByText(paragraph, { exact: true })).toBeVisible();
  for (const takeaway of lesson.keyTakeaways) await expect(page.getByText(takeaway, { exact: true })).toBeVisible();
  await page.getByText("Contents", { exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Lesson contents" })).toBeVisible();
  await page.getByRole("button", { name: "Mark complete & continue" }).click();
  await expect(page).toHaveURL(/strengths-and-limits\/$/);
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").completedLessons, progressKey)).toContain("foundations/data-and-bias");
  await page.goto(lessonPath);
  await expect(page.getByRole("button", { name: "Continue learning", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Continue learning", exact: true }).click();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").xp, progressKey)).toBe(10);
});

test("the first badge uses a persistent live region and final dismissal returns focus", async ({ page }) => {
  await page.addInitScript(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: progressKey, state: { ...initialState, completedActivities: ["tools"] } });
  await page.goto(lessonPath);
  const live = page.locator(".badge-toast-live");
  const toast = live.locator(".badge-toast");
  await expect(live).toHaveAttribute("aria-live", "polite");
  await expect(toast).toHaveCount(0);
  await page.getByRole("button", { name: "Mark complete & continue" }).click();
  await expect(toast).toContainText("New badge unlocked");
  await expect(toast).toContainText("First Steps");
  const dismiss = live.getByRole("button", { name: "Dismiss badge notification" });
  await expect(dismiss).toHaveAttribute("aria-keyshortcuts", "Escape");
  await expect(dismiss.locator("kbd")).toBeVisible();
  await dismiss.focus();
  await expect(dismiss).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(toast).toContainText("Prompt Engineer");
  await expect(dismiss).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toast).toHaveCount(0);
  await expect(page.locator("#main")).toBeFocused();
});

test("Prompt Lab saves and clears a genuine local draft, with one completion", async ({ page }) => {
  await page.goto(promptPath);
  await page.getByRole("textbox", { name: "Your improved prompt" }).fill(prompt);
  await expect(page.getByText("Draft saved on this device.", { exact: true })).toBeVisible();
  await expect(page.getByText("Passed", { exact: true })).toHaveCount(5);
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Your improved prompt" })).toHaveValue(prompt);
  await expect(page.getByRole("button", { name: "Complete prompt lab", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Complete prompt lab", exact: true }).click();
  const complete = page.getByRole("button", { name: "Activity complete", exact: true });
  await expect(complete).toBeFocused();
  await expect(complete).toHaveAttribute("aria-disabled", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: "Activity complete", exact: true })).toHaveAttribute("aria-disabled", "true");
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").xp, progressKey)).toBe(25);
  await page.getByRole("button", { name: "Clear draft", exact: true }).click();
  await expect(page.getByText("Draft cleared from this device.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Your improved prompt" })).toHaveValue("");
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").activities["tools/prompt-lab"], draftKey)).toBeUndefined();
});

test("pending draft flushes when navigating away before the debounce", async ({ page }) => {
  await page.goto(promptPath);
  await page.getByRole("textbox", { name: "Your improved prompt" }).fill("A teacher with a new idea");
  await page.getByRole("link", { name: "My learning", exact: true }).click();
  await page.goto(promptPath);
  await expect(page.getByRole("textbox", { name: "Your improved prompt" })).toHaveValue("A teacher with a new idea");
});

test("storage write failures retain editable text and truthful feedback", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException("Storage blocked", "QuotaExceededError"); }; });
  await page.goto(promptPath);
  await page.getByRole("textbox", { name: "Your improved prompt" }).fill(prompt);
  await expect(page.getByText("Draft not saved. Keep a copy of your text before leaving.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Your improved prompt" })).toHaveValue(prompt);
  await expect(page.getByText(/Progress could not be saved on this device/)).toBeVisible();
  await page.getByRole("button", { name: "Complete prompt lab", exact: true }).click();
  const complete = page.getByRole("button", { name: "Activity complete", exact: true });
  await expect(complete).toBeFocused();
  await expect(complete).toHaveAttribute("aria-disabled", "true");
});

test("home sampler checks the shared rubric without saving or completing activity", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Make it more specific" }).fill(prompt);
  await expect(page.getByText("5 of 5 rubric terms found")).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), draftKey)).toBeNull();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").completedActivities, progressKey)).toEqual([]);
});

test("returning learners get a hydrated next task and compatible progress imports", async ({ page }) => {
  const original = { ...initialState, xp: 10, startedAt: "2026-09-18T12:00:00.000Z", completedLessons: ["foundations/what-is-ai"], badges: ["first-steps"] };
  await page.addInitScript(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: progressKey, state: original });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Continue learning", exact: true })).toHaveAttribute("href", "/modules/ai-foundations/lessons/rules-and-learning/");
  await page.goto("/learn/");
  await page.getByLabel("Import progress").setInputFiles({ name: "legacy.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(original)) });
  await expect(page.getByText("Progress imported.", { exact: true })).toBeVisible();
  await page.getByLabel("Import progress").setInputFiles({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from('{"version":1,"completedLessons":[null]}') });
  await expect(page.getByText(/Import failed/)).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").completedLessons, progressKey)).toEqual(original.completedLessons);
});

test("quiz advances once, focuses the next question and reviews incorrect answers", async ({ page }) => {
  await page.goto(`/modules/${foundations.slug}/quiz/`);
  for (const [index, question] of foundations.quiz.entries()) {
    if (question.estimate) {
      const value = index === 0 ? question.estimate.answer + question.estimate.tolerance * 3 : question.estimate.answer;
      await page.getByLabel("Your estimate").fill(String(value));
      await page.getByRole("button", { name: "Lock it in", exact: true }).click();
    } else {
      await page.getByRole("button", { name: question.choices[index === 0 ? 0 : question.answerIndex], exact: true }).click();
    }
    const next = page.getByRole("button", { name: index === 4 ? "See results" : "Next question", exact: true });
    await next.evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
    await expect(page.getByRole("heading", { name: index === 4 ? "80%" : foundations.quiz[index + 1].prompt, exact: true })).toBeFocused();
  }
  await expect(page.getByRole("heading", { name: "A second look." })).toBeVisible();
  await expect(page.locator(".answer-strip li")).toHaveCount(5);
  await expect(page.locator(".answer-strip li[data-correct='false']")).toHaveCount(1);
  await expect(page.getByText(foundations.quiz[0].explanation, { exact: true })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").xp, progressKey)).toBe(40);
});

test("answering a quiz question focuses Next question", async ({ page }) => {
  await page.goto(`/modules/${foundations.slug}/quiz/`);
  await page.locator(".answer-choice").first().click();
  await expect(page.getByRole("button", { name: "Next question" })).toBeFocused();
});

test("motion preference persists and public copy is available without JavaScript", async ({ page, browser }) => {
  await page.goto("/");
  await page.getByLabel("Motion", { exact: true }).selectOption("reduced");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page.reload();
  await expect(page.getByLabel("Motion", { exact: true })).toHaveValue("reduced");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto("http://127.0.0.1:3100/");
  await expect(staticPage.getByRole("heading", { name: "Ask better. Think further." })).toBeVisible();
  await expect(staticPage.getByRole("link", { name: "Explore lessons", exact: true }).first()).toBeVisible();
  await context.close();
});
