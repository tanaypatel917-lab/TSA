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
  await expect(page.getByRole("heading", { name: "Credits and copyright" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Copyright checklist" })).toBeVisible();
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

test("hallucination hunt catches fake pages and can be replayed", async ({ page }) => {
  await seed(page);
  const response = await page.goto("/does-not-exist/");
  expect(response?.status()).toBe(404);

  for (const name of ["Homework answers", "Secret level 99", "Teacher's grade book"]) {
    await page.getByRole("button", { name: new RegExp(name) }).click();
  }

  await page.getByRole("button", { name: "Check my answers" }).click();
  await expect(page.getByRole("status")).toHaveText("You caught 3 of 3 fakes, no false alarms");
  await expect(page.locator(".hunt-grid").getByRole("link", { name: /Glossary/ })).toHaveAttribute("href", /\/glossary\/?$/);

  await page.getByRole("button", { name: "Play again" }).click();
  await expect(page.getByRole("button", { name: "Check my answers" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("case-study completion keeps focus on the completion key", async ({ page }) => {
  await seed(page);
  await page.goto("/modules/ai-in-the-real-world/activity/");
  const cases = page.locator(".field-case");
  await expect(cases).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    if (index > 0) await cases.nth(index).locator(".field-toggle").click();
    const field = cases.nth(index).locator("textarea");
    await expect(field).toBeVisible();
    await field.fill(`Reflection ${index + 1}`);
  }
  await page.getByRole("button", { name: "Complete case studies", exact: true }).click();
  const complete = page.getByRole("button", { name: "Activity complete", exact: true });
  await expect(complete).toBeFocused();
  await expect(complete).toHaveAttribute("aria-disabled", "true");
});

test("capstone completion keeps focus on the completion key", async ({ page }) => {
  await seed(page);
  await page.goto("/modules/capstone/activity/");
  const steps = page.locator(".brief-steps textarea");
  await expect(steps).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) await steps.nth(index).fill(`Plan detail ${index + 1}`);
  await page.getByRole("button", { name: "Complete capstone", exact: true }).click();
  const complete = page.getByRole("button", { name: "Plan complete", exact: true });
  await expect(complete).toBeFocused();
  await expect(complete).toHaveAttribute("aria-disabled", "true");
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

test("choosing a scenario option focuses Next scenario", async ({ page }) => {
  await seed(page);
  await page.goto("/modules/ethical-ai/activity/");
  await page.locator(".answer-choice").first().click();
  await expect(page.getByRole("button", { name: "Next scenario" })).toBeFocused();
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

test("glossary terms can be spoken out loud", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("wordplay:intro:v1", "seen");
    const said: string[] = [];
    (window as unknown as { said: string[] }).said = said;
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { getVoices: () => [], cancel: () => {}, speak: (utterance: SpeechSynthesisUtterance) => { said.push(utterance.text); } } });
  });
  await page.goto("/glossary/");
  await page.getByRole("button", { name: "Say “Model” out loud" }).click();
  expect(await page.evaluate(() => (window as unknown as { said: string[] }).said)).toEqual(["Model"]);
});

test("My learning wraps up progress so far", async ({ page }) => {
  const state = { version: 1, xp: 185, completedLessons: ["foundations/what-is-ai"], completedActivities: [], quizBest: { foundations: 90, tools: 100 }, badges: [], streak: { count: 1, lastDay: "2026-10-11" }, startedAt: "2026-10-02T15:00:00.000Z" };
  await page.addInitScript((saved) => { localStorage.setItem("wordplay:intro:v1", "seen"); localStorage.setItem("wordplay:progress:v1", saved); }, JSON.stringify(state));
  await page.goto("/learn/");
  const recap = page.getByRole("region", { name: "Your Wordplay, wrapped." });
  await expect(recap).toBeVisible();
  await expect(recap.getByText("The Fact-Checker")).toBeVisible();
  await expect(recap.getByText("95%")).toBeVisible();
  await expect(recap.getByRole("link", { name: /See what’s left/ })).toHaveAttribute("href", "#certificate-title");
});

test("Explore points to the certificate at the finish line", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("wordplay:intro:v1", "seen"));
  await page.goto("/modules/");
  const goal = page.getByRole("region", { name: "Finish all five. Print your certificate." });
  await expect(goal).toBeVisible();
  await expect(goal.getByRole("link", { name: /See your progress/ })).toHaveAttribute("href", /\/learn\/#certificate-title$/);
});
