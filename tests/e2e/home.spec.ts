import { expect, test } from "@playwright/test";
import { modules } from "../../src/content";
import { missions } from "../../src/content/missions";
import { predictorCorpus } from "../../src/content/predictor";
import { BADGES } from "../../src/engine/badges";
import { predict, tokenize, train } from "../../src/engine/predictor";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("wordplay:intro:v1", "seen"));
});

test("the hero demo predicts next words with probabilities and builds a sentence", async ({ page }) => {
  await page.goto("/");
  const demo = page.getByRole("region", { name: "Guess the next word, like a language model." });
  const expected = predict(train(predictorCorpus), tokenize("AI can")).guesses;
  const first = demo.getByRole("button", { name: `Add “${expected[0].word}”, ${Math.round(expected[0].p * 100)}% likely` });
  await expect(first).toBeVisible();
  await first.click();
  await expect(demo.locator(".demo-sentence")).toHaveAttribute("aria-label", `Sentence so far: AI can ${expected[0].word}`);
  await demo.getByRole("button", { name: "Reset" }).click();
  await expect(demo.locator(".demo-sentence")).toHaveAttribute("aria-label", "Sentence so far: AI can");
  await demo.getByRole("button", { name: "Always check…" }).click();
  await expect(demo.getByRole("button", { name: "Always check…" })).toHaveAttribute("aria-pressed", "true");
  await expect(demo.getByRole("link", { name: /How language models work/ })).toHaveAttribute("href", "/modules/ai-foundations/lessons/language-models/");
});

test("with reduced motion, Let it write finishes the sentence at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const demo = page.getByRole("region", { name: "Guess the next word, like a language model." });
  await demo.getByRole("slider").fill("0");
  await demo.getByRole("button", { name: "Let it write" }).click();
  await expect(demo).toContainText("Sentence finished.");
  await expect(demo.locator(".demo-sentence")).toHaveAttribute("aria-label", /\.$/);
  await expect(demo.getByRole("button", { name: "Let it write" })).toBeDisabled();
});

test("the title guessing demo shows the settled word immediately with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const demo = page.locator(".title-guess");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(demo).toHaveAttribute("data-finished", "true");
  await expect(demo.locator(".title-guess-tile")).toHaveText(["W", "O", "R", "D", "P", "L", "A", "Y"]);
  await expect(demo.locator(".title-guess-pill")).toHaveText("Most likely: WORDPLAY");
  await expect(demo.getByRole("button", { name: "Replay" })).toHaveCount(0);
});

test("the title guessing demo animates through candidates, settles, and replays", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("wordplay:motion:v1", "full"));
  await page.goto("/");
  const demo = page.locator(".title-guess");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await expect(demo.locator(".title-guess-tile")).toHaveText(["W", "O", "R", "D", "P", "L", "A", "Y"], { timeout: 5000 });
  await expect(demo.locator(".title-guess-pill")).toHaveText("Most likely: WORDPLAY");
  const replay = demo.getByRole("button", { name: "Replay", exact: true });
  await expect(replay).toBeVisible();
  await replay.click();
  await expect(demo.locator(".title-guess-tile")).toHaveText(["M", "_", "_", "_", "_", "_", "_", "_"]);
});

test("the title guessing tiles fit their column from phone to desktop widths", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const row = page.locator(".title-guess-tiles");

  for (const width of [360, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await row.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, left: bounds.left, right: bounds.right, viewport: window.innerWidth };
    });
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.left).toBeGreaterThanOrEqual(0);
    expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test("the homepage shows the course at a glance and previews progress and badges", async ({ page }) => {
  await page.goto("/");
  const facts = page.locator(".hero-facts");
  await expect(facts).toContainText(String(modules.length));
  await expect(facts).toContainText(String(modules.reduce((total, module) => total + module.lessons.length, 0)));
  await expect(facts).toContainText(String(missions.length));
  await expect(facts).toContainText(String(BADGES.length));
  await expect(page.getByRole("heading", { level: 2, name: "Learning that levels up." })).toBeVisible();
  await expect(page.getByRole("link", { name: `All ${BADGES.length} badges` })).toHaveAttribute("href", "/badges/");
});
