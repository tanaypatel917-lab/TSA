import { expect, test, type Page } from "@playwright/test";
import { modules } from "../../src/content";

const complete = {
  version: 1, xp: 720,
  completedLessons: modules.flatMap((module) => module.lessons.map((lesson) => `${module.id}/${lesson.id}`)),
  completedActivities: modules.map((module) => module.id),
  quizBest: Object.fromEntries(modules.map((module) => [module.id, 90])),
  badges: [], streak: { count: 2, lastDay: "2027-01-02" }, startedAt: "2027-01-01", world: { words: [], stamps: [] }
};

async function seed(page: Page, state?: object) {
  await page.addInitScript((value) => {
    localStorage.setItem("wordplay:intro:v1", "seen");
    if (value) localStorage.setItem("wordplay:progress:v1", value);
    window.print = () => { (window as unknown as { printed: boolean }).printed = true; };
  }, state ? JSON.stringify(state) : "");
}

test("the certificate stays locked until every chapter is complete", async ({ page }) => {
  await seed(page);
  await page.goto("/learn/");
  const section = page.getByRole("region", { name: "A certificate waits at the end." });
  await expect(section).toContainText("Finish all five chapters");
  await expect(section.getByRole("button", { name: "Print certificate" })).toHaveCount(0);
});

test("a finished course prints a certificate with the typed name, which is never saved", async ({ page }) => {
  await seed(page, complete);
  await page.goto("/learn/");
  const section = page.getByRole("region", { name: "You finished Wordplay." });
  const print = section.getByRole("button", { name: "Print certificate" });
  await expect(print).toBeDisabled();
  await section.getByLabel("Name for the certificate (not saved)").fill("Ava Chen");
  await print.click();
  expect(await page.evaluate(() => (window as unknown as { printed: boolean }).printed)).toBe(true);
  const sheet = page.locator("#print-root");
  await expect(sheet).toContainText("Ava Chen");
  await expect(sheet).toContainText("Certificate of completion");
  for (const module of modules) await expect(sheet).toContainText(module.title);
  await expect(sheet).toContainText("720 XP · AI Ally");
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).not.toContain("Ava Chen");
});
