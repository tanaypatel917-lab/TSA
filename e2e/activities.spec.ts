import { test, expect, type Page } from "@playwright/test";
import { modules } from "@/content";
import type { Module } from "@/content/types";

const STORAGE_KEY = "ai-compass:progress:v1";
const esc = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function completeActivity(page: Page, module: Module) {
  const activity = module.activity;
  switch (activity.kind) {
    case "classifier": {
      for (let i = 0; i < activity.items.length; i += 1) {
        const item = activity.items[i];
        await expect(page.getByText(`Message ${i + 1} of ${activity.items.length}`)).toBeVisible();
        await page.getByRole("button", { name: item.label === "spam" ? "Spam" : "Not spam", exact: true }).click();
      }
      await expect(page.getByText("Classifier complete")).toBeVisible();
      break;
    }
    case "prompt-lab": {
      await page.getByLabel("Your improved prompt").fill(activity.rubric.map((rule) => rule.keywords[0]).join(" "));
      await page.getByRole("button", { name: "Complete prompt lab" }).click();
      await expect(page.getByRole("button", { name: "Activity complete" })).toBeVisible();
      break;
    }
    case "scenarios": {
      for (let i = 0; i < activity.scenarios.length; i += 1) {
        const scenario = activity.scenarios[i];
        const option = scenario.options.find((candidate) => candidate.ok) ?? scenario.options[0];
        await page.getByRole("button", { name: option.text, exact: true }).click();
        await page.getByRole("button", { name: i === activity.scenarios.length - 1 ? "Finish" : "Next scenario" }).click();
      }
      await expect(page.getByText("Scenarios complete")).toBeVisible();
      break;
    }
    case "case-studies": {
      for (const item of activity.cases) {
        await page.getByRole("button", { name: new RegExp(esc(item.title)) }).click();
        await page.locator("textarea").fill("My reflection");
      }
      await page.getByRole("button", { name: "Complete case studies" }).click();
      await expect(page.getByRole("button", { name: "Activity complete" })).toBeVisible();
      break;
    }
    case "capstone": {
      for (let i = 0; i < activity.steps.length; i += 1) {
        await page.locator("textarea").nth(i).fill(`Answer for step ${i + 1}`);
      }
      await page.getByRole("button", { name: "Complete capstone" }).click();
      await expect(page.getByText("Plan complete")).toBeVisible();
      break;
    }
  }
}

for (const module of modules) {
  test(`activity completes for ${module.title} (${module.activity.kind})`, async ({ page }) => {
    await page.goto(`/modules/${module.slug}/activity/`);
    await completeActivity(page, module);
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), STORAGE_KEY);
    expect(stored.completedActivities).toContain(module.id);
    expect(stored.xp).toBe(25);
  });
}
