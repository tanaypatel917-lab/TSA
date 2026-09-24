import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("wordplay:intro:v1", "seen"));
});

const lab = (page: Page, title: string) => page.getByRole("figure", { name: title });

test("foundation lessons explain systems, rules and tokens hands-on", async ({ page }) => {
  await page.goto("/modules/ai-foundations/lessons/what-is-ai/");
  const system = lab(page, "Every AI system: data in, patterns out.");
  await system.getByRole("button", { name: "A photo" }).click();
  await expect(system.locator(".is-output")).toContainText("Cat");

  await page.goto("/modules/ai-foundations/lessons/rules-and-learning/");
  const rules = lab(page, "Write a spam rule. Watch it break.");
  await expect(rules.locator(".lab-score")).toContainText("4 of 8");
  await rules.getByRole("textbox").fill("");
  await expect(rules.locator(".lab-score")).toContainText("4 of 8");
  await rules.getByRole("textbox").fill("prize, verify, reward, win!!!");
  await expect(rules.locator(".lab-score")).toContainText("7 of 8");

  await page.goto("/modules/ai-foundations/lessons/language-models/");
  const tokens = lab(page, "See text the way a model does.");
  await tokens.getByRole("textbox").fill("Models don't read.");
  await expect(tokens.locator(".lab-stats")).toContainText("Tokens6");
  await expect(page.getByRole("region", { name: "Guess the next word, like a language model." })).toBeVisible();
});

test("the bias lab shows a gap from one-sided data that mixed data closes", async ({ page }) => {
  await page.goto("/modules/ai-foundations/lessons/data-and-bias/");
  const bias = lab(page, "Train a fruit sorter on one farm’s photos.");
  await expect(bias.locator(".bias-gap")).toContainText("point gap");
  await bias.getByRole("slider").fill("0.5");
  await expect(bias.locator(".bias-gap")).toContainText("The gap is small");
  await expect(bias.getByRole("img")).toHaveAttribute("aria-label", /Farm A accuracy \d+%, Farm B accuracy \d+%/);
});

test("learners spot hallucinations, build prompts and see answers vary", async ({ page }) => {
  await page.goto("/modules/ai-foundations/lessons/strengths-and-limits/");
  const claims = lab(page, "Spot the hallucinations.");
  for (let turn = 0; turn < 5; turn += 1) await claims.getByRole("button", { name: "Made up" }).first().click();
  await expect(claims).toContainText("You caught 3 of 3");

  await page.goto("/modules/ai-tools/lessons/prompt-anatomy/");
  const prompt = lab(page, "Build a prompt one part at a time.");
  await expect(prompt).toContainText("1 of 5 parts");
  await prompt.getByRole("button", { name: "Format" }).click();
  await expect(prompt.locator(".is-answer")).toContainText("•");
  await expect(prompt.getByRole("button", { name: "Task" })).toBeDisabled();

  await page.goto("/modules/ai-tools/lessons/iterate-verify/");
  const vary = lab(page, "Ask the same question three times.");
  await vary.getByRole("slider").fill("0");
  await vary.getByRole("button", { name: "Ask three times" }).click();
  await expect(vary.locator(".vary-list li")).toHaveCount(3);
  await expect(vary).toContainText("All three answers match");
});

test("the privacy lesson only calls a prompt safe once every personal detail is removed", async ({ page }) => {
  await page.goto("/modules/ethical-ai/lessons/privacy/");
  const redact = lab(page, "Clean up a prompt before you send it.");
  await redact.getByRole("button", { name: "Send to the chatbot" }).click();
  await expect(redact.getByRole("status")).toContainText("8 personal details are still in the prompt");
  for (const chip of await redact.locator(".redact-chip").all()) await chip.click();
  await expect(redact.locator(".lab-score")).toContainText("8 of 8");
  await redact.getByRole("button", { name: "Send to the chatbot" }).click();
  await expect(redact.getByRole("status")).toContainText("Safe to send");
});
