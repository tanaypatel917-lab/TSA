import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { getModule } from "@/content";

const STORAGE_KEY = "ai-compass:progress:v1";
const foundations = getModule("ai-foundations");
if (!foundations) throw new Error("ai-foundations module missing");

const esc = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("golden path: lesson, badge, quiz, persistence, export, reset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Start learning/ }).click();

  await page.getByRole("heading", { name: foundations.title }).click();
  await page.getByRole("link", { name: new RegExp(esc(foundations.lessons[0].title)) }).click();
  await page.getByRole("button", { name: "Mark complete & continue →" }).click();

  const toast = page.locator('[aria-live="polite"]');
  await expect(toast).toContainText("New badge unlocked");
  await expect(toast).toContainText("First Steps");

  await page.goto("/");
  await expect(page.getByText("10 XP", { exact: true })).toBeVisible();

  await page.goto(`/modules/${foundations.slug}/quiz/`);
  for (const question of foundations.quiz) {
    await page.getByRole("button", { name: question.choices[question.answerIndex], exact: true }).click();
    await expect(page.getByText("Correct!")).toBeVisible();
    await page.getByRole("button", { name: /Next question|See results/ }).click();
  }
  await expect(page.getByText("Quiz complete")).toBeVisible();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("60 XP", { exact: true })).toBeVisible();
  const expectedPercent = Math.round(((1 + 1) / (foundations.lessons.length + 2)) * 100);
  const foundationsCard = page.locator(".card").filter({ has: page.getByRole("heading", { name: foundations.title }) });
  await expect(foundationsCard).toContainText(`${expectedPercent}%`);

  await page.reload();
  await expect(page.getByText("60 XP", { exact: true })).toBeVisible();
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), STORAGE_KEY);
  expect(stored.xp).toBe(60);
  expect(stored.quizBest[foundations.id]).toBe(100);
  expect(stored.completedLessons).toContain(`${foundations.id}/${foundations.lessons[0].id}`);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("ai-compass-progress.json");
  const downloadPath = await download.path();
  const exported = JSON.parse(readFileSync(downloadPath!, "utf-8"));
  expect(exported.xp).toBe(60);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("link", { name: /Start learning/ })).toBeVisible();
  const afterReset = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), STORAGE_KEY);
  expect(afterReset === null || afterReset.xp === 0).toBeTruthy();
});
