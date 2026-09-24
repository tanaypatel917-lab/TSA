export type Fruit = { x: number; y: number; ripe: boolean; farm: "A" | "B" };

function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (value: number) => Math.max(0.02, Math.min(0.98, value));

export function orchard(seed: number, perGroup: number): Fruit[] {
  const next = random(seed);
  const fruit: Fruit[] = [];
  for (const farm of ["A", "B"] as const) {
    for (const ripe of [true, false]) {
      for (let index = 0; index < perGroup; index += 1) {
        const shade = farm === "B" ? -0.27 : 0;
        const color = (ripe ? 0.76 : 0.4) + shade + (next() - 0.5) * 0.2;
        const firm = (ripe ? 0.4 : 0.62) + (next() - 0.5) * 0.32;
        fruit.push({ x: clamp(color), y: clamp(firm), ripe, farm });
      }
    }
  }
  return fruit;
}

export const pool = orchard(11, 40);
export const exam = orchard(97, 30);

export function trainingSet(shareB: number, size = 40) {
  const fromB = Math.round(size * shareB);
  const take = (farm: "A" | "B", count: number) => [true, false].flatMap((ripe) => pool.filter((item) => item.farm === farm && item.ripe === ripe).slice(0, Math.ceil(count / 2)));
  return [...take("A", size - fromB), ...take("B", fromB)];
}

export function centroids(data: readonly Fruit[]) {
  const mean = (items: readonly Fruit[]) => ({ x: items.reduce((sum, item) => sum + item.x, 0) / items.length, y: items.reduce((sum, item) => sum + item.y, 0) / items.length });
  return { ripe: mean(data.filter((item) => item.ripe)), unripe: mean(data.filter((item) => !item.ripe)) };
}

export function classify(model: ReturnType<typeof centroids>, item: { x: number; y: number }) {
  const gap = (point: { x: number; y: number }) => (item.x - point.x) ** 2 + (item.y - point.y) ** 2;
  return gap(model.ripe) < gap(model.unripe);
}

export function accuracy(model: ReturnType<typeof centroids>, farm: "A" | "B") {
  const items = exam.filter((item) => item.farm === farm);
  return items.filter((item) => classify(model, item) === item.ripe).length / items.length;
}

const prefixes = ["un", "re", "pre", "dis"];
const suffixes = ["ing", "able", "ible", "ness", "ment", "ed", "er", "est", "ly", "s"];

export function tokens(text: string) {
  const out: string[] = [];
  for (const match of text.matchAll(/\s*(?:[A-Za-z]+(?:'[a-z]+)?|\d+|[^\sA-Za-z\d])/g)) {
    const raw = match[0];
    const space = raw.match(/^\s*/)?.[0] ? " " : "";
    let word = raw.trim();
    const pieces: string[] = [];
    const lower = word.toLowerCase();
    const contraction = lower.match(/^(.*?)(n't|'s|'re|'ll|'ve|'m|'d)$/);
    let tail: string[] = [];
    if (contraction && contraction[1]) { tail = [word.slice(contraction[1].length)]; word = word.slice(0, contraction[1].length); }
    const prefix = /^[a-z]+$/i.test(word) && word.length > 6 ? prefixes.find((item) => word.toLowerCase().startsWith(item)) : undefined;
    if (prefix) { pieces.push(word.slice(0, prefix.length)); word = word.slice(prefix.length); }
    const suffix = /^[a-z]+$/i.test(word) && word.length > 5 ? suffixes.find((item) => word.toLowerCase().endsWith(item)) : undefined;
    if (suffix) pieces.push(word.slice(0, -suffix.length), word.slice(-suffix.length)); else pieces.push(word);
    pieces.push(...tail);
    pieces.forEach((piece, index) => out.push(index === 0 ? space + piece : piece));
  }
  return out;
}

export function ruleFlags(text: string, keywords: readonly string[]) {
  const lower = text.toLowerCase();
  return keywords.map((keyword) => keyword.trim().toLowerCase()).filter(Boolean).some((keyword) => lower.includes(keyword));
}
