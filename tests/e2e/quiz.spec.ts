import { expect, test, type Page } from "@playwright/test";
import { foundations } from "../../src/content/modules/foundations";
import type { ProgressState } from "../../src/engine/progress";

const progressKey = "wordplay:progress:v1";
const introKey = "wordplay:intro:v1";
const quizPath = `/modules/${foundations.slug}/quiz/`;

async function readProgress(page: Page): Promise<ProgressState | null> {
  return page.evaluate((key) => {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }, progressKey);
}

async function answerQuiz(page: Page, correctAnswers: boolean[]) {
  expect(correctAnswers).toHaveLength(foundations.quiz.length);

  for (const [index, question] of foundations.quiz.entries()) {
    await expect(page.getByText(`Question ${index + 1} of ${foundations.quiz.length}`, { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: question.prompt, exact: true })).toBeVisible();

    if (question.estimate) {
      const value = correctAnswers[index] ? question.estimate.answer : question.estimate.answer + question.estimate.tolerance * 3;
      await page.getByLabel("Your estimate").fill(String(value));
      await page.getByRole("button", { name: "Lock it in", exact: true }).click();
    } else {
      const choiceIndex = correctAnswers[index]
        ? question.answerIndex
        : (question.answerIndex + 1) % question.choices.length;
      await page.getByRole("button", { name: question.choices[choiceIndex], exact: true }).click();
    }
    await expect(page.getByText(question.explanation, { exact: true })).toBeVisible();
    await page.getByRole("button", {
      name: index === foundations.quiz.length - 1 ? "See results" : "Next question",
      exact: true,
    }).click();
  }

  await expect(page.getByText("Quiz complete", { exact: true })).toBeVisible();
}

async function expectBest(page: Page, score: number) {
  await expect.poll(async () => (await readProgress(page))?.quizBest.foundations ?? 0, {
    message: `Stored quizBest.foundations should be ${score}`,
  }).toBe(score);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "seen"), introKey);
  await page.goto(quizPath);
  await expect(page.getByRole("heading", { name: "Knowledge check", exact: true })).toBeVisible();
  await expect.poll(async () => (await readProgress(page))?.quizBest).toEqual({});
});

const attempts = [
  { name: "4/5 with the final answer correct", answers: [false, true, true, true, true], score: 80 },
  { name: "4/5 with the final answer incorrect", answers: [true, true, true, true, false], score: 80 },
  { name: "3/5 with the final answer correct", answers: [false, false, true, true, true], score: 60 },
  { name: "0/5", answers: [false, false, false, false, false], score: 0 },
  { name: "5/5", answers: [true, true, true, true, true], score: 100 },
];

for (const attempt of attempts) {
  test(`${attempt.name} displays and saves the actual score`, async ({ page }) => {
    await answerQuiz(page, attempt.answers);
    await expect(page.getByRole("heading", { name: `${attempt.score}%`, exact: true })).toBeVisible();
    await expectBest(page, attempt.score);

    const progress = await readProgress(page);
    expect(progress?.xp).toBe(attempt.score / 2);
    if (attempt.score === 100) {
      expect(progress?.badges).toContain("perfect-quiz");
    } else {
      expect(progress?.badges).not.toContain("perfect-quiz");
    }

    await page.reload();
    await expectBest(page, attempt.score);
  });
}

test("a lower-score retry resets the attempt and preserves the saved best", async ({ page }) => {
  await answerQuiz(page, [true, true, true, true, false]);
  await expect(page.getByRole("heading", { name: "80%", exact: true })).toBeVisible();
  await expectBest(page, 80);

  await page.getByRole("button", { name: "Retry quiz", exact: true }).click();
  await answerQuiz(page, [true, false, false, false, true]);
  await expect(page.getByRole("heading", { name: "40%", exact: true })).toBeVisible();
  await expectBest(page, 80);
  expect((await readProgress(page))?.xp).toBe(40);

  await page.reload();
  await expectBest(page, 80);
});

test("an estimate answer shows when a guess falls outside the tolerance", async ({ page }) => {
  for (const question of foundations.quiz.slice(0, 2)) {
    await page.getByRole("button", { name: question.choices[question.answerIndex], exact: true }).click();
    await page.getByRole("button", { name: "Next question", exact: true }).click();
  }

  const slider = page.getByRole("slider", { name: "Your estimate" });
  await expect(page.getByRole("heading", { name: foundations.quiz[2].prompt, exact: true })).toBeVisible();
  await expect(slider).toHaveValue("550");
  await slider.fill("500");
  await page.getByRole("button", { name: "Lock it in", exact: true }).click();

  await expect(page.locator(".answer-feedback")).toHaveAttribute("data-good", "false");
  await expect(page.getByRole("status")).toContainText("Not quite.");
  await expect(page.getByText("You: 500 · Real: about 400", { exact: true })).toBeVisible();
});
