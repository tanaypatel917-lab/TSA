import { introAutoOrder, introPromptParts, type IntroPartId } from "@/content/intro";

export type ActSpan = { top: number; height: number };
export type TimelinePosition = { t: number; act: number; local: number; progress: number };

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
export const damp = (current: number, target: number, lambda: number, dt: number) => lerp(current, target, 1 - Math.exp(-lambda * dt));
export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const pseudoRandom = (index: number, seed: number) => {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
};
export const wallColorIndex = (index: number) => Math.floor(pseudoRandom(index, 7) * 4);

export function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function rgbToHex(rgb: readonly number[]) {
  return `#${rgb.slice(0, 3).map((channel) => Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, "0")).join("")}`;
}

export function mixHex(from: string, to: string, amount: number) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  return rgbToHex(start.map((channel, index) => lerp(channel, end[index], clamp(amount))));
}

export function resolveTimeline(spans: readonly ActSpan[], scrollY: number, viewport: number): TimelinePosition {
  if (!spans.length) return { t: 0, act: 0, local: 0, progress: 0 };
  const last = spans.length - 1;
  const start = spans[0].top;
  const end = Math.max(start + 1, spans[last].top + spans[last].height - viewport);
  const progress = clamp((scrollY - start) / (end - start));
  for (let index = 0; index <= last; index += 1) {
    const span = spans[index];
    const offset = scrollY - span.top;
    if (index < last && offset >= span.height) continue;
    const hold = Math.max(0, span.height - viewport);
    if (offset <= 0) return { t: index, act: index, local: 0, progress };
    if (offset <= hold || index === last) return { t: index, act: index, local: hold ? clamp(offset / hold) : 1, progress };
    return { t: index + clamp((offset - hold) / viewport), act: index, local: 1, progress };
  }
  return { t: last, act: last, local: 1, progress };
}

export function orderedParts(selected: readonly IntroPartId[]) {
  return introPromptParts.filter((part) => selected.includes(part.id));
}

export function composeIntroPrompt(selected: readonly IntroPartId[]) {
  return orderedParts(selected).map((part) => part.sentence).join(" ");
}

export function nextIntroHint(selected: readonly IntroPartId[]) {
  return introPromptParts.find((part) => !selected.includes(part.id))?.hint ?? "All five parts. Specific enough to be useful.";
}

export function autoIntroParts(count: number): IntroPartId[] {
  return introAutoOrder.slice(0, Math.round(clamp(count, 0, introAutoOrder.length)));
}

export function autoPartCount(t: number, local: number, act: number) {
  if (t < act - 0.5) return 1;
  if (t > act + 0.5) return introAutoOrder.length;
  return Math.round(clamp(1 + Math.floor(local * 5.4), 1, introAutoOrder.length));
}
