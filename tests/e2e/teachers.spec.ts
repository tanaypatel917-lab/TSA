import { expect, test } from "@playwright/test";
import { modules } from "../../src/content";
import { chapterPlans } from "../../src/content/toolkit";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("wordplay:intro:v1", "seen");
    window.print = () => { (window as unknown as { printed: number }).printed = ((window as unknown as { printed?: number }).printed ?? 0) + 1; };
  });
});

test("the toolkit is linked from the footer, About and the homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /For teachers: plans and worksheets/ })).toHaveAttribute("href", "/teachers/");
  await expect(page.locator(".site-footer").getByRole("link", { name: "Teachers", exact: true })).toHaveAttribute("href", "/teachers/");
  await page.goto("/about/");
  await page.getByRole("link", { name: /Open the teacher toolkit/ }).click();
  await expect(page).toHaveURL(/\/teachers\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Teach AI literacy in five chapters." })).toBeVisible();
});

test("chapter plans switch by keyboard and print the plan, worksheet and answer guide", async ({ page }) => {
  await page.goto("/teachers/");
  const tabs = page.getByRole("tablist", { name: "Chapter plans" });
  await expect(tabs.getByRole("tab")).toHaveCount(chapterPlans.length);
  const first = tabs.getByRole("tab").first();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  const tools = modules.find((module) => module.id === "tools")!;
  await expect(tabs.getByRole("tab", { selected: true })).toContainText("Tools");
  const panel = page.getByRole("tabpanel");
  await expect(panel.getByRole("heading", { level: 3 })).toHaveText(tools.title);
  await expect(panel).toContainText("Big Idea 4");
  await expect(panel.locator(".plan-timing")).toContainText("Total");

  await panel.getByRole("button", { name: "Print worksheet" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-print", "worksheet-tools");
  await expect(page.locator("#print-root")).toContainText("Worksheet: AI Tools & Techniques");
  await expect(page.locator("#print-root .sheet-questions li")).toHaveCount(6);
  await panel.getByRole("button", { name: "Print answer guide" }).click();
  await expect(page.locator("#print-root")).toContainText(chapterPlans[1].worksheet[0].answer);
  expect(await page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(2);
});

test("the progress checker reads exported files locally and rejects others", async ({ page }) => {
  await page.goto("/teachers/");
  const good = { version: 1, xp: 180, completedLessons: modules[0].lessons.map((lesson) => `foundations/${lesson.id}`), completedActivities: ["foundations"], quizBest: { foundations: 80, tools: 40 }, badges: ["first-steps"], streak: { count: 3, lastDay: "2027-01-02" }, startedAt: "2027-01-01", world: { words: [], stamps: [] } };
  await page.locator(".checker input[type=file]").setInputFiles([
    { name: "ava.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(good)) },
    { name: "notes.json", mimeType: "application/json", buffer: Buffer.from("not progress") }
  ]);
  const row = page.getByRole("region", { name: "Student progress" }).getByRole("row", { name: /ava/ });
  await expect(row).toContainText("1 of 5");
  await expect(row).toContainText("80%");
  await expect(row).toContainText("180 XP · Explorer");
  await expect(row).toContainText("3 days");
  await expect(page.locator(".checker").getByRole("alert")).toContainText("notes.json: this isn’t a Wordplay progress file.");
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByRole("region", { name: "Student progress" })).toHaveCount(0);
});

test("the policy builder previews choices and prints a one-page policy", async ({ page }) => {
  await page.goto("/teachers/");
  await page.getByLabel("Class name").fill("Period 3 Biology");
  await page.getByRole("checkbox", { name: "Getting feedback on work I wrote" }).check();
  const preview = page.locator(".policy-preview");
  await expect(preview.getByRole("heading", { level: 3 })).toHaveText("AI use in Period 3 Biology");
  await expect(preview).toContainText("Getting feedback on work I wrote");
  await page.getByRole("button", { name: "Print policy" }).click();
  await expect(page.locator("#print-root")).toContainText("AI use in Period 3 Biology");
  expect(await page.evaluate(() => localStorage.getItem("wordplay:policy-draft"))).toBeNull();
});

test("the toolkit fits a phone screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/teachers/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
