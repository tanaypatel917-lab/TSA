import { expect, test, type Page } from "@playwright/test";
import { formatCitation, referenceGroups, referencesForLesson } from "../../src/content/references";

const introKey = "wordplay:intro:v1";
const all = referenceGroups.flatMap((group) => group.references);
const connections = all.reduce((total, reference) => total + Math.max(reference.lessons.length, 1), 0);
const searchable = (reference: (typeof all)[number]) => [reference.title, reference.authors, reference.publisher, reference.short, reference.note, reference.source ?? ""].join(" ").toLowerCase();

async function open(page: Page) {
  await page.addInitScript((key) => localStorage.setItem(key, "seen"), introKey);
  await page.goto("/references/");
}

test("the evidence board lights a lesson's sources and narrows the list to match", async ({ page }) => {
  await open(page);
  const lessons = page.getByRole("group", { name: "Lessons" });
  const sources = page.getByRole("group", { name: "Sources" });
  const expected = referencesForLesson("foundations", "data-and-bias");
  await expect(page.locator(".board-strings path")).toHaveCount(connections);
  const lesson = lessons.getByRole("button", { name: /Training data and bias/ });
  await lesson.click();
  await expect(lesson).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await expect(page.locator('.board-strings path[data-lit="true"]')).toHaveCount(expected.length);
  await expect(page.locator(".board-status")).toContainText(`Training data and bias is backed by ${expected.length} sources.`);
  await expect(page.locator("#directory-count")).toHaveText(`Showing ${expected.length} of ${all.length} sources, for Training data and bias`);
  await expect(page.locator(".reference-item")).toHaveCount(expected.length);

  const gender = sources.getByRole("button", { name: /Gender Shades/ });
  await gender.focus();
  await expect(lessons.getByRole("button", { name: /Bias and fairness/ })).toHaveAttribute("data-lit", "true");
  await page.keyboard.press("ArrowDown");
  await expect(sources.getByRole("button", { name: /Amazon/ })).toBeFocused();
  await page.getByRole("button", { name: "Stop filtering by Training data and bias" }).click();
  await expect(page.locator(".reference-item")).toHaveCount(all.length);
  await expect(lesson).toHaveAttribute("aria-pressed", "false");
});

test("the directory filters by type and search, and copies an APA citation", async ({ page }) => {
  await page.addInitScript(() => {
    const clipboard = { text: "", writeText: async (text: string) => { clipboard.text = text; } };
    Object.defineProperty(navigator, "clipboard", { value: clipboard, configurable: true });
  });
  await open(page);
  const journalism = all.filter((reference) => reference.kind === "journalism");
  await page.locator(".choice", { hasText: "Journalism" }).click();
  await expect(page.getByRole("radio", { name: /Journalism/ })).toBeChecked();
  await expect(page.locator(".reference-item")).toHaveCount(journalism.length);
  await expect(page.locator("#directory-count")).toHaveText(`Showing ${journalism.length} of ${all.length} sources`);
  await page.locator(".choice", { hasText: "All" }).click();
  await page.getByLabel("Search sources").fill("unesco");
  await expect(page.locator(".reference-item")).toHaveCount(all.filter((reference) => searchable(reference).includes("unesco")).length);
  await page.getByLabel("Search sources").fill("zzzz");
  await expect(page.getByText("No sources match “zzzz”.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".reference-item")).toHaveCount(all.length);

  const dastin = all.find((reference) => reference.id === "dastin-2018")!;
  const copy = page.locator("#ref-dastin-2018 .copy-citation");
  await copy.click();
  await expect(copy).toContainText("Copied");
  await expect(page.getByRole("status").filter({ hasText: "Citation copied" })).toHaveText(`Citation copied for ${dastin.short}.`);
  expect(await page.evaluate(() => (navigator.clipboard as unknown as { text: string }).text)).toBe(formatCitation(dastin));
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error("blocked")); });
  await page.locator("#ref-perrigo-2023 .copy-citation").click();
  await expect(page.locator("#ref-perrigo-2023 .copy-citation")).toContainText("Copy failed");
  await expect(page.getByRole("status").filter({ hasText: "Copy failed" })).toBeVisible();
});

test("printing clears filters and prints only the citations", async ({ page }) => {
  await page.addInitScript(() => { window.print = () => { document.documentElement.dataset.printed = "true"; }; });
  await open(page);
  await page.getByLabel("Search sources").fill("unesco");
  await page.getByRole("button", { name: "Print references" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-printed", "true");
  await expect(page.getByLabel("Search sources")).toHaveValue("");
  await expect(page.locator(".reference-item")).toHaveCount(all.length);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".evidence")).toBeHidden();
  await expect(page.locator(".directory-tools")).toBeHidden();
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".reference-citation").first()).toBeVisible();
});

test("on a phone the board becomes lesson chips that filter the list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await expect(page.getByRole("group", { name: "Sources" })).toBeHidden();
  await expect(page.locator(".board-strings")).toBeHidden();
  await page.getByRole("group", { name: "Lessons" }).getByRole("button", { name: /Environmental and labor impact/ }).click();
  await expect(page.locator(".reference-item")).toHaveCount(referencesForLesson("ethics", "impact").length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("reduced motion keeps the publisher marquee still", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await open(page);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  expect(await page.locator(".marquee-track").evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  await context.close();
});

test("without JavaScript the board, strings and every citation still render", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/references/");
  await expect(page.locator(".reference-item")).toHaveCount(all.length);
  await expect(page.locator(".board-strings path")).toHaveCount(connections);
  await expect(page.locator(".board-strings")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Where our facts come from." })).toBeVisible();
  await context.close();
});
