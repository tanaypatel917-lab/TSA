import { expect, test, type Page } from "@playwright/test";
import { modules } from "../../src/content";
import { glossary } from "../../src/content/glossary";
import { missions } from "../../src/content/missions";
import { RUN } from "../../src/engine/mission";
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

async function playMission(page: Page, moduleId: string, answer: (gate: string, gates: string[]) => string) {
  const mission = missions.find((item) => item.moduleId === moduleId)!;
  const dialog = page.getByRole("dialog");
  for (let turn = 0; turn < RUN.count; turn += 1) {
    const card = dialog.locator(".map-mission-card .carry-text");
    if (!(await card.isVisible().catch(() => false))) break;
    const text = await card.innerText();
    const item = mission.items.find((entry) => entry.text === text);
    if (!item) break;
    const label = mission.gates.find((gate) => gate.id === answer(item.gate, mission.gates.map((each) => each.id)))!.label;
    await dialog.getByRole("button", { name: label, exact: true }).click();
    await expect(dialog.locator(".map-mission-feedback")).not.toHaveText("Choose the gate where this crate belongs.");
  }
}

test("a mission briefing explains the rules and a perfect relaxed run stamps the station", async ({ page }) => {
  await seed(page);
  await page.goto("/play/");
  const opener = page.locator(".world-station-list").getByRole("button", { name: /AI Foundations/ });
  await opener.click();
  const briefing = page.getByRole("dialog", { name: "Train the spam filter" });
  await expect(briefing.getByRole("heading", { level: 2 })).toBeFocused();
  await expect(briefing.locator(".mission-gates")).toContainText("Spam");
  await expect(briefing.locator(".mission-gates")).toContainText("Inbox");
  await briefing.getByRole("checkbox", { name: /Relaxed mode/ }).check();
  await briefing.getByRole("button", { name: /Start mission/ }).click();
  await expect(page.locator(".mission-hud-clock")).toHaveAttribute("aria-label", "Relaxed mode, no clock");
  await playMission(page, "foundations", (gate) => gate);
  const results = page.getByRole("dialog", { name: "Perfect run." });
  await expect(results).toBeVisible();
  await expect(results.getByRole("img", { name: "3 of 3 stars" })).toBeVisible();
  await expect(results).toContainText(`Station stamped · +${WORLD_XP.stamp} XP`);
  await expect(results).toContainText(`First perfect run · +${WORLD_XP.perfect} XP`);
  await expect(results.locator(".results-list li")).toHaveCount(RUN.count);
  await results.getByRole("button", { name: "Back to the world" }).click();
  await expect(opener).toBeFocused();
  await expect(opener.getByRole("img", { name: "3 of 3 stars" })).toBeVisible();
  const state = await saved(page);
  expect(state.world?.stamps).toEqual(["foundations"]);
  expect(state.world?.stars).toEqual({ foundations: 3 });
  expect(state.world?.best?.foundations).toBe(100 + 200 + 300 + 400 * (RUN.count - 3));
  expect(state.xp).toBe(WORLD_XP.stamp + WORLD_XP.perfect);
});

test("three wrong gates end a timed run without a stamp and explain each answer", async ({ page }) => {
  await seed(page);
  await page.goto("/play/");
  await page.locator(".world-station-list").getByRole("button", { name: /AI Tools/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Start mission/ }).click();
  await expect(page.locator(".mission-hud-clock")).toHaveAttribute("aria-label", /seconds left/);
  await playMission(page, "tools", (gate, gates) => gates.find((each) => each !== gate)!);
  const results = page.getByRole("dialog", { name: "Keep practicing." });
  await expect(results).toContainText("Three mistakes. Run over.");
  await expect(results.locator('.results-list li[data-ok="false"]')).toHaveCount(RUN.lives);
  await expect(results).toContainText("Sort at least");
  expect((await saved(page)).world?.stamps).toEqual([]);
});

test("the last stamp and the last word unlock the two world badges", async ({ page }) => {
  const words = glossary.map((entry) => entry.term);
  await seed(page, { ...initialState, world: { words: words.slice(1), stamps: modules.slice(1).map((module) => module.id) } });
  await page.goto("/play/");
  await page.locator(".world-word-list button").first().click();
  await expect(page.locator(".word-card h2")).toHaveText(words[0]);
  await page.locator(".word-card").getByRole("button", { name: /Collect/ }).click();
  await page.locator(".world-station-list").getByRole("button", { name: /AI Foundations/ }).click();
  await page.getByRole("dialog").getByRole("checkbox", { name: /Relaxed mode/ }).check();
  await page.getByRole("dialog").getByRole("button", { name: /Start mission/ }).click();
  await playMission(page, "foundations", (gate) => gate);
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
