import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { modules } from "@/content";

const STORAGE_KEY = "ai-compass:progress:v1";
const foundations = modules[0];

const pages = [
  "/",
  "/modules/",
  "/badges/",
  "/glossary/",
  "/sources/",
  "/about/",
  `/modules/${foundations.slug}/`,
  `/modules/${foundations.slug}/lessons/${foundations.lessons[0].id}/`,
  `/modules/${foundations.slug}/activity/`,
  `/modules/${foundations.slug}/quiz/`
];

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

// Reduced motion makes the motion components render their settled, non-animated
// paths so axe measures final colors rather than mid-fade opacity blends.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const path of pages) {
  test(`@a11y ${path} has no serious violations`, async ({ page }) => {
    await page.goto(path);
    await expectNoSeriousViolations(page);
  });
}

test("@a11y / started dashboard has no serious violations", async ({ page }) => {
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, value),
    {
      key: STORAGE_KEY,
      value: JSON.stringify({
        version: 1,
        xp: 10,
        completedLessons: ["foundations/what-is-ai"],
        completedActivities: [],
        quizBest: {},
        badges: ["first-steps"],
        streak: { count: 1, lastDay: "2026-01-01" },
        startedAt: "2026-01-01T12:00:00.000Z"
      })
    }
  );
  await page.goto("/dashboard/");
  await expectNoSeriousViolations(page);
});
