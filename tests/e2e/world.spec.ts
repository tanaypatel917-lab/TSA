import { expect, test, type Page } from "@playwright/test";
import { modules } from "../../src/content";
import { glossary } from "../../src/content/glossary";
import { initialState, WORLD_XP, type ProgressState } from "../../src/engine/progress";

const progressKey = "wordplay:progress:v1";
const introKey = "wordplay:intro:v1";

async function seed(page: Page, state?: ProgressState) {
  await page.addInitScript(({ intro, progress, saved }) => {
    localStorage.setItem(intro, "2026-09-22T12:00:00.000Z");
    if (saved) localStorage.setItem(progress, JSON.stringify(saved));
  }, { intro: introKey, progress: progressKey, saved: state });
}

const saved = (page: Page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null") as ProgressState, progressKey);

test("Play is in the navigation and the world falls back to a working map without 3D", async ({ page }) => {
  await seed(page);
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Play" }).click();
  await expect(page).toHaveURL(/\/play\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Wordplay World" })).toBeVisible();
  const world = page.locator(".world");
  await expect(world).toHaveAttribute("data-mode", "map");
  await expect(world).toHaveAttribute("data-scene-state", "disabled");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByText("3D is switched off in this build, so the world opens as a map.")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Station \d\d:/ })).toHaveCount(modules.length);
  await expect(page.getByRole("button", { name: /^Word: / })).toHaveCount(glossary.length);
});

test("collecting a word shows its definition, awards XP once, and saves it", async ({ page }) => {
  await seed(page);
  await page.goto("/play/");
  const token = glossary.find((entry) => entry.term === "Hallucination")!;
  await page.locator(".world-word-list").getByRole("button", { name: token.term }).click();
  const card = page.locator(".word-card");
  await expect(card).toContainText(token.definition);
  await expect(card.getByRole("link", { name: /In the glossary/ })).toHaveAttribute("href", "/glossary/#term-hallucination");
  await card.getByRole("button", { name: `Collect · +${WORLD_XP.word} XP` }).click();
  await expect(card).toContainText(`New word · +${WORLD_XP.word} XP`);
  await expect(page.locator(".world-counts")).toContainText(`1/${glossary.length}`);
  await expect(page.getByRole("button", { name: "Word: Hallucination, collected" })).toBeVisible();
  const state = await saved(page);
  expect(state.world?.words).toEqual([token.term]);
  expect(state.xp).toBe(WORLD_XP.word);
  await page.reload();
  await page.locator(".world-word-list").getByRole("button", { name: token.term }).click();
  await expect(page.locator(".word-card")).toContainText("Collected word");
  await expect(page.locator(".word-card").getByRole("button", { name: /Collect/ })).toHaveCount(0);
});

test("a station check stamps the station on a correct answer and returns focus", async ({ page }) => {
  await seed(page);
  await page.goto("/play/");
  const foundations = modules[0];
  const opener = page.locator(".world-station-list").getByRole("button", { name: /AI Foundations/ });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "How does it learn?" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();
  const [first, second] = foundations.quiz;
  const wrong = first.choices.findIndex((_, index) => index !== first.answerIndex);
  await dialog.getByRole("button", { name: first.choices[wrong] }).click();
  await expect(dialog.getByRole("status")).toContainText("Not quite.");
  await dialog.getByRole("button", { name: "Try another question" }).click();
  await expect(dialog).toContainText(second.prompt);
  await dialog.getByRole("button", { name: second.choices[second.answerIndex] }).click();
  await expect(dialog.getByRole("status")).toContainText(`Station stamped · +${WORLD_XP.stamp} XP`);
  await expect(dialog.locator(".station-stamp")).toHaveText("Stamped");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(opener).toContainText("Stamped");
  const state = await saved(page);
  expect(state.world?.stamps).toEqual(["foundations"]);
  expect(state.xp).toBe(WORLD_XP.stamp);
});

test("the last stamp and the last word unlock the two world badges", async ({ page }) => {
  const words = glossary.map((entry) => entry.term);
  await seed(page, { ...initialState, world: { words: words.slice(1), stamps: modules.slice(1).map((module) => module.id) } });
  await page.goto("/play/");
  await page.locator(".world-word-list button").first().click();
  await expect(page.locator(".word-card h2")).toHaveText(words[0]);
  await page.locator(".word-card").getByRole("button", { name: /Collect/ }).click();
  await page.locator(".world-station-list").getByRole("button", { name: /AI Foundations/ }).click();
  const question = modules[0].quiz[0];
  await page.getByRole("dialog").getByRole("button", { name: question.choices[question.answerIndex] }).click();
  await page.getByRole("button", { name: "Back to the world" }).click();
  await expect.poll(async () => (await saved(page)).badges).toEqual(expect.arrayContaining(["world-explorer", "word-collector"]));
  await page.goto("/badges/");
  await expect(page.getByRole("heading", { name: "World Explorer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Word Collector" })).toBeVisible();
});

test("the homepage teases game mode and About lists the world XP", async ({ page }) => {
  await seed(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: /Take the question for a drive/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Play Wordplay World/ })).toHaveAttribute("href", "/play/");
  await page.goto("/about/");
  await expect(page.locator(".xp-list")).toContainText(`+${WORLD_XP.word} XP`);
  await expect(page.locator(".xp-list")).toContainText(`+${WORLD_XP.stamp} XP`);
});
