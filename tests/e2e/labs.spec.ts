import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("wordplay:intro:v1", "seen"));
});

const lab = (page: Page, title: string) => page.getByRole("figure", { name: title });
const pipTitle = "Meet Pip. Is it thinking, or following a menu?";
const fakePageTitle = "This page looks real. Is it?";
const fakePageAddress = "brightside-news.example/science/naps-boost-scores";
const juryTitle = "Meet the models. Why do they disagree?";
const detectorTitle = "Can a detector really tell?";
const diceTitle = "Roll a challenge. Write the prompt.";
const cookieTitle = "Who's watching this page?";

async function tabUntilFocused(page: Page, target: ReturnType<Page["getByRole"]>) {
  for (let index = 0; index < 100; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Could not reach the target using Tab");
}

test("Pip follows written keyword rules and exposes the fired rule", async ({ page }) => {
  await page.goto("/modules/ai-foundations/lessons/rules-and-learning/");
  const pip = lab(page, pipTitle);
  const log = pip.getByRole("log", { name: "Conversation with Pip" });
  await expect(pip.locator(".chatbot-window-header")).toContainText("Pip · school helper bot");
  await expect(log.locator(".chatbot-window-header")).toHaveCount(0);
  await pip.getByRole("button", { name: "I'm not stressed at all" }).click();
  await expect(log.locator(".chatbot-turn[data-sender='pip']").last()).toContainText("counselor");

  const hood = pip.getByRole("button", { name: "Look under the hood" });
  await hood.click();
  await expect(hood).toHaveAttribute("aria-expanded", "true");
  await expect(pip.locator(".chatbot-rule-table tr").filter({ hasText: "feelings" })).toHaveAttribute("data-fired", "true");
  await expect(log.locator(".chatbot-rule-tag").last()).toContainText('Rule: feelings · matched "stressed"');

  const input = pip.getByRole("textbox", { name: "Message Pip" });
  await input.fill("Can you explain photosynthesis?");
  await input.press("Enter");
  await expect(log.locator(".chatbot-turn[data-sender='pip']").last()).toContainText("Sorry, I didn't get that.");
  await expect(pip.locator(".chatbot-fallback-row")).toHaveAttribute("data-fired", "true");
  await pip.getByRole("button", { name: "Start over" }).click();
  await expect(log.locator(".chatbot-turn[data-sender='pip']")).toHaveCount(1);
  await expect(log.locator(".chatbot-turn[data-sender='student']")).toHaveCount(0);
});

test("Pip's conversation and hood work with keyboard alone", async ({ page }) => {
  await page.goto("/modules/ai-foundations/lessons/rules-and-learning/");
  const pip = lab(page, pipTitle);
  const feeling = pip.getByRole("button", { name: "I'm not stressed at all" });
  await tabUntilFocused(page, feeling);
  await page.keyboard.press("Enter");
  const log = pip.getByRole("log", { name: "Conversation with Pip" });
  await expect(log.locator(".chatbot-turn[data-sender='pip']").last()).toContainText("counselor");

  const hood = pip.getByRole("button", { name: "Look under the hood" });
  await tabUntilFocused(page, hood);
  await page.keyboard.press("Enter");
  await expect(hood).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  const input = pip.getByRole("textbox", { name: "Message Pip" });
  await expect(input).toBeFocused();
  await page.keyboard.type("Can you explain photosynthesis?");
  await page.keyboard.press("Enter");
  await expect(log.locator(".chatbot-turn[data-sender='pip']").last()).toContainText("Sorry, I didn't get that.");
  await expect(pip.locator(".chatbot-fallback-row")).toHaveAttribute("data-fired", "true");
  const reset = pip.getByRole("button", { name: "Start over" });
  await tabUntilFocused(page, reset);
  await page.keyboard.press("Enter");
  await expect(log.locator(".chatbot-turn[data-sender='pip']")).toHaveCount(1);
});

test("the chatbot hood stacks at 360px and the rules hood counts flagged messages", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/modules/ai-foundations/lessons/rules-and-learning/");
  const pip = lab(page, pipTitle);
  await pip.getByRole("button", { name: "Look under the hood" }).click();
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(widths.document).toBe(widths.viewport);

  const rules = lab(page, "Write a spam rule. Watch it break.");
  await rules.getByRole("button", { name: "Look under the hood" }).click();
  await expect(rules.locator(".rule-keyword-counts li").filter({ hasText: "win" })).toContainText("2 messages flagged");
});

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

test("the hallucination spotter keeps focus as claims are decided and reset", async ({ page }) => {
  await page.goto("/modules/ai-foundations/lessons/strengths-and-limits/");
  const claimItems = page.locator(".claim-list > li");
  await expect(claimItems).toHaveCount(5);
  for (let turn = 0; turn < 5; turn += 1) {
    await claimItems.nth(turn).locator(".claim-actions button").first().click();
    if (turn === 0) {
      await expect(page.locator(".claim-list > li").nth(1).locator(".claim-actions button").first()).toBeFocused();
    }
  }
  await expect(page.locator(".lab-score")).toBeFocused();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".claim-list > li").first().locator(".claim-actions button").first()).toBeFocused();
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

test("the cookie lab reveals invented partners and switches by keyboard", async ({ page }) => {
  await page.goto("/modules/ethical-ai/lessons/privacy/");
  const cookie = lab(page, cookieTitle);
  const banner = cookie.getByRole("region", { name: "Pretend cookie banner" });
  await banner.getByRole("button", { name: "Show all partners (847)" }).click();

  const list = banner.getByRole("region", { name: "Partner list" });
  await expect(list.locator("li")).toHaveCount(12);
  await expect(list).toContainText("All partner names here are made up.");
  await expect(list).toContainText("…and 835 more");
  const firstSwitch = list.getByRole("switch", { name: "Legitimate interest for Pixel Hound" });
  await expect(firstSwitch).toHaveAttribute("aria-checked", "true");
  await tabUntilFocused(page, firstSwitch);
  await page.keyboard.press("Space");
  await expect(firstSwitch).toHaveAttribute("aria-checked", "false");

  await banner.getByRole("button", { name: "Manage options" }).click();
  await expect(list).toContainText("Switch off each one you don't want.");
});

test("the cookie lab explains Accept and resets every option", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/modules/ethical-ai/lessons/privacy/");
  const cookie = lab(page, cookieTitle);
  const banner = cookie.getByRole("region", { name: "Pretend cookie banner" });
  await banner.getByRole("button", { name: "Accept all" }).click();

  const heading = cookie.getByRole("heading", { name: "One click, 847 companies." });
  await expect(heading).toBeFocused();
  await expect(cookie.locator(".cookie-trick-list li")).toHaveCount(4);
  await expect(cookie.locator(".cookie-compare")).toContainText("prod.spline.design");
  await expect(cookie.getByRole("status")).toContainText("You chose Accept all.");
  await expect(banner.locator(".cookie-sticker")).toHaveCount(3);
  await banner.getByRole("button", { name: "Show all partners (847)" }).click();
  await expect(banner.locator(".cookie-sticker")).toHaveCount(4);

  await cookie.getByRole("button", { name: "Try again" }).click();
  await expect(heading).toHaveCount(0);
  await expect(cookie.getByRole("status")).toHaveText("");
  await banner.getByRole("button", { name: "Show all partners (847)" }).click();
  await expect(banner.getByRole("switch", { name: "Legitimate interest for Pixel Hound" })).toHaveAttribute("aria-checked", "true");
});

test("the cookie lab shows the Reject result", async ({ page }) => {
  await page.goto("/modules/ethical-ai/lessons/privacy/");
  const cookie = lab(page, cookieTitle);
  await cookie.getByRole("button", { name: "Reject all" }).click();
  await expect(cookie.getByRole("heading", { name: "You found the grey link." })).toBeFocused();
  await expect(cookie).toContainText("Saying no should be as easy as saying yes. Here it wasn't.");
});

test("the cookie banner respects reduced motion and its partner list scrolls at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/modules/ethical-ai/lessons/privacy/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  const cookie = lab(page, cookieTitle);
  const banner = cookie.getByRole("region", { name: "Pretend cookie banner" });
  const address = cookie.locator(".cookie-browser-address");
  await expect(address).toHaveCSS("white-space", "nowrap");
  await expect(address).toHaveCSS("text-overflow", "ellipsis");
  await expect(cookie.locator(".cookie-study-heading span")).toHaveCSS("white-space", "nowrap");
  await expect(banner).toHaveCSS("animation-name", "none");
  await banner.getByRole("button", { name: "Show all partners (847)" }).click();
  const list = banner.getByRole("region", { name: "Partner list" });
  expect(await list.evaluate((element) => element.scrollHeight)).toBeGreaterThan(await list.evaluate((element) => element.clientHeight));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("the fake-page lab finds clues, reveals the fabrication, and resets", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/modules/ethical-ai/lessons/misinformation/");
  const fakePage = lab(page, fakePageTitle);
  const counter = fakePage.locator(".fakepage-counter");
  const address = fakePage.getByRole("button", { name: fakePageAddress });
  const byline = fakePage.getByRole("button", { name: "Dana Whitfield" });

  await expect(fakePage.getByRole("button", { name: "Reveal the truth" })).toBeVisible();
  await address.click();
  await byline.click();
  await expect(counter).toHaveText("2 of 5 clues found");
  await expect(address).toHaveAttribute("aria-pressed", "true");
  await expect(byline).toHaveAttribute("aria-pressed", "true");

  await fakePage.getByRole("button", { name: "31% higher" }).click();
  const stamp = fakePage.getByText("THIS DOESN'T EXIST.", { exact: true });
  const revealHeading = fakePage.getByRole("heading", { name: "The truth" });
  await expect(stamp).toBeVisible();
  await expect(revealHeading).toBeFocused();
  const review = fakePage.locator(".fakepage-review-list");
  await expect(review.locator('[data-state="found"]')).toHaveCount(3);
  await expect(review.locator('[data-state="missed"]')).toHaveCount(2);

  await fakePage.getByRole("button", { name: "Try again" }).click();
  await expect(counter).toHaveText("0 of 5 clues found");
  await expect(stamp).toHaveCount(0);
  await expect(address).toHaveAttribute("aria-pressed", "false");

  await fakePage.getByRole("button", { name: "Reveal the truth" }).click();
  await expect(stamp).toBeVisible();
  await expect(revealHeading).toBeFocused();
  await expect(review.locator('[data-state="found"]')).toHaveCount(0);
  await expect(review.locator('[data-state="missed"]')).toHaveCount(5);
  await fakePage.getByRole("button", { name: "Try again" }).click();

  const hood = fakePage.getByRole("button", { name: "Look under the hood" });
  await hood.click();
  await expect(hood).toHaveAttribute("aria-expanded", "true");
  await expect(fakePage.getByText("Every clue was planted on purpose:", { exact: true })).toBeVisible();
  for (const name of ["Address", "Byline", "31% statistic", "Quote", "Share count"]) {
    await expect(fakePage.getByText(name, { exact: true })).toBeVisible();
  }
});

test("the fake-page lab works by keyboard with reduced motion at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/modules/ethical-ai/lessons/misinformation/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  const fakePage = lab(page, fakePageTitle);
  const address = fakePage.getByRole("button", { name: fakePageAddress });
  const statistic = fakePage.getByRole("button", { name: "31% higher" });
  const byline = fakePage.getByRole("button", { name: "Dana Whitfield" });

  await tabUntilFocused(page, address);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(statistic).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(fakePage.locator(".fakepage-counter")).toHaveText("2 of 5 clues found");
  await page.keyboard.press("Tab");
  await expect(byline).toBeFocused();
  await page.keyboard.press("Enter");

  const stamp = fakePage.getByText("THIS DOESN'T EXIST.", { exact: true });
  await expect(stamp).toBeVisible();
  await expect(fakePage.getByRole("heading", { name: "The truth" })).toBeFocused();
  expect(await stamp.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});

test("the model jury compares a three-model panel and shows its training biases", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/modules/ethical-ai/lessons/fairness/");
  const jury = lab(page, juryTitle);
  const max = jury.getByRole("button", { name: /^Max\./ });
  const rex = jury.getByRole("button", { name: /^Rex\./ });
  const bo = jury.getByRole("button", { name: /^Bo\./ });

  await max.click();
  await rex.click();
  await bo.click();
  await jury.getByRole("button", { name: "A fluffy cat on grass" }).click();
  await jury.getByRole("button", { name: "Ask the panel" }).click();
  await expect(jury.getByRole("heading", { name: "Panel tally" })).toBeFocused();
  await expect(jury.locator(".jury-tally")).toHaveText("2 say Dog, 1 says Not a dog");
  await expect(jury.locator(".jury-correct-answer")).toHaveText("Correct answer: Not a dog, it's a cat");
  await expect(bo.locator(".jury-vote-correctness")).toHaveText("Right");
  const hood = jury.getByRole("button", { name: "Look under the hood" });
  await hood.click();
  await expect(jury.locator(".jury-hood-list")).toContainText("Trained on: 500 photos of golden retrievers");
  await expect(jury.locator(".jury-hood-list")).toContainText("Current vote reason: “Pointed ears and whiskers: a cat”");

  await jury.getByRole("button", { name: /^Ivy\./ }).click();
  await expect(jury.getByRole("status").filter({ hasText: "Your panel is full. Unpick one first." })).toBeVisible();
});

test("the jury can be run by keyboard alone", async ({ page }) => {
  await page.goto("/modules/ethical-ai/lessons/fairness/");
  const jury = lab(page, juryTitle);
  const max = jury.getByRole("button", { name: /^Max\./ });
  await tabUntilFocused(page, max);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  const photo = jury.getByRole("button", { name: "A fluffy cat on grass" });
  await tabUntilFocused(page, photo);
  await page.keyboard.press("Enter");
  const ask = jury.getByRole("button", { name: "Ask the panel" });
  await tabUntilFocused(page, ask);
  await page.keyboard.press("Enter");
  await expect(jury.locator(".jury-tally")).toHaveText("2 say Dog, 1 says Not a dog");
});

test("TruthMeter scans passages with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/modules/ethical-ai/lessons/academic-integrity/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  const detector = lab(page, detectorTitle);
  await detector.getByRole("button", { name: "Passage 1" }).click();
  await detector.getByRole("button", { name: "Scan" }).click();
  await expect(detector.getByText("87% AI", { exact: true })).toBeVisible();
  await expect(detector.getByRole("meter", { name: "87% AI score" })).toBeVisible();
  await expect(detector.locator(".detector-result").getByText("A person. It's the U.S. Declaration of Independence (1776), drafted by Thomas Jefferson.", { exact: true })).toBeVisible();
  await expect(detector.getByRole("heading", { name: "Talk about it" })).toBeVisible();
  await expect(detector.getByRole("status")).toContainText("Score: 87% AI");

  const passageTwo = detector.getByRole("button", { name: "Passage 2" });
  await tabUntilFocused(page, passageTwo);
  await page.keyboard.press("Enter");
  const scan = detector.getByRole("button", { name: "Scan" });
  await tabUntilFocused(page, scan);
  await page.keyboard.press("Enter");
  await expect(detector.locator(".detector-score-label")).toHaveText("LIKELY HUMAN");
});

test("TruthMeter can be scanned by keyboard alone", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/modules/ethical-ai/lessons/academic-integrity/");
  const detector = lab(page, detectorTitle);
  const passage = detector.getByRole("button", { name: "Passage 1" });
  await tabUntilFocused(page, passage);
  await page.keyboard.press("Enter");
  const scan = detector.getByRole("button", { name: "Scan" });
  await tabUntilFocused(page, scan);
  await page.keyboard.press("Enter");
  await expect(detector.getByText("87% AI", { exact: true })).toBeVisible();
  await expect(detector.getByRole("heading", { name: "Talk about it" })).toBeVisible();
});

test("both ethics labs fit at 360px without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/modules/ethical-ai/lessons/fairness/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.goto("/modules/ethical-ai/lessons/academic-integrity/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("prompt challenge dice checks a complete prompt and rerolls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/modules/ai-tools/lessons/prompt-anatomy/");
  const dice = lab(page, diceTitle);
  const firstChallenge = "Explain photosynthesis to a 10-year-old in 3 sentences";
  await expect(dice.locator(".prompt-dice-challenge")).toContainText(firstChallenge);
  const input = dice.getByRole("textbox", { name: "Your prompt" });
  await input.fill("Act as a friendly tutor. Explain photosynthesis to a 10-year-old in 3 sentences using simple words.");
  await expect(dice.locator(".prompt-dice-meter-row strong")).toHaveText("5 of 5");
  await expect(dice.locator(".prompt-dice-meter-copy")).toHaveText("Specific: a challenge you can check.");

  await dice.getByRole("button", { name: "Roll the dice" }).click();
  await expect(dice.locator(".prompt-dice-challenge")).not.toContainText(firstChallenge);
  await expect(dice.getByRole("status")).toContainText("New challenge:");
  const hood = dice.getByRole("button", { name: "Look under the hood" });
  await hood.click();
  await expect(hood).toHaveAttribute("aria-expanded", "true");
  await expect(dice.locator(".prompt-dice-hood")).toContainText("act as / you are / as a");
  await expect(dice.locator(".prompt-dice-hood")).toContainText("12 or more words");
});

test("prompt challenge dice works with keyboard only", async ({ page }) => {
  await page.goto("/modules/ai-tools/lessons/prompt-anatomy/");
  const dice = lab(page, diceTitle);
  const challenge = dice.locator(".prompt-dice-challenge");
  const firstChallenge = await challenge.innerText();
  const input = dice.getByRole("textbox", { name: "Your prompt" });
  await tabUntilFocused(page, input);
  await page.keyboard.type("Act as a friendly tutor. Explain photosynthesis to a 10-year-old in 3 sentences using simple words.");
  await expect(dice.locator(".prompt-dice-meter-row strong")).toHaveText("5 of 5");
  const roll = dice.getByRole("button", { name: "Roll the dice" });
  await tabUntilFocused(page, roll);
  await page.keyboard.press("Enter");
  await expect(challenge).not.toHaveText(firstChallenge);
  const hood = dice.getByRole("button", { name: "Look under the hood" });
  await tabUntilFocused(page, hood);
  await page.keyboard.press("Enter");
  await expect(hood).toHaveAttribute("aria-expanded", "true");
});

test("prompt challenge dice fits at 360px without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/modules/ai-tools/lessons/prompt-anatomy/");
  await expect(lab(page, diceTitle)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("Present mode turns a lesson into keyboard-driven slides", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("wordplay:intro:v1", "seen"));
  await page.goto("/modules/ai-foundations/lessons/what-is-ai/");
  const open = page.getByRole("button", { name: "Present" });
  await open.click();
  const deck = page.getByRole("dialog", { name: /^Presenting: / });
  await expect(deck).toBeVisible();
  await expect(deck.getByText(/^Slide 1 of \d+$/)).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(deck.getByText(/^Slide 2 of \d+$/)).toBeVisible();
  await expect(deck.getByText(/^01 \/ \d\d$/)).toBeVisible();
  await page.keyboard.press("End");
  await expect(deck.getByRole("heading", { name: "Questions?" })).toBeVisible();
  await expect(deck.getByRole("button", { name: "Next slide" })).toBeDisabled();
  await page.keyboard.press("ArrowLeft");
  await expect(deck.getByRole("heading", { name: "Take this with you." })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(deck).toBeHidden();
  await expect(open).toBeFocused();
});
