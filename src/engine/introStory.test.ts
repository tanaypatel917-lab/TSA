import { describe, expect, it } from "vitest";
import { introPromptParts } from "@/content/intro";
import { autoIntroParts, autoPartCount, composeIntroPrompt, mixHex, nextIntroHint, resolveTimeline } from "./introStory";

const viewport = 900;
const spans = [{ top: 0, height: 1440 }, { top: 1440, height: 1710 }, { top: 3150, height: 1260 }];

describe("intro timeline", () => {
  it("holds each act while pinned, then blends into the next act over one viewport", () => {
    expect(resolveTimeline(spans, 0, viewport)).toMatchObject({ t: 0, act: 0, local: 0 });
    expect(resolveTimeline(spans, 270, viewport)).toMatchObject({ t: 0, act: 0, local: 0.5 });
    expect(resolveTimeline(spans, 540, viewport)).toMatchObject({ t: 0, local: 1 });
    expect(resolveTimeline(spans, 990, viewport).t).toBeCloseTo(0.5);
    expect(resolveTimeline(spans, 1440, viewport)).toMatchObject({ t: 1, act: 1, local: 0 });
    expect(resolveTimeline(spans, 1440 + 405, viewport)).toMatchObject({ t: 1, local: 0.5 });
  });

  it("clamps before the first act and at the end of the final act", () => {
    expect(resolveTimeline(spans, -200, viewport)).toMatchObject({ t: 0, local: 0, progress: 0 });
    expect(resolveTimeline(spans, 99999, viewport)).toMatchObject({ t: 2, act: 2, local: 1, progress: 1 });
    expect(resolveTimeline([], 400, viewport)).toMatchObject({ t: 0, progress: 0 });
  });

  it("reports overall progress across the scrollable story", () => {
    const end = 3150 + 1260 - viewport;
    expect(resolveTimeline(spans, end / 2, viewport).progress).toBeCloseTo(0.5);
  });
});

describe("intro colors", () => {
  it("mixes brand colors without leaving the sRGB range", () => {
    expect(mixHex("#351B2B", "#EF99AC", 0)).toBe("#351b2b");
    expect(mixHex("#351B2B", "#EF99AC", 1)).toBe("#ef99ac");
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mixHex("#000000", "#ffffff", 4)).toBe("#ffffff");
  });
});

describe("intro prompt builder", () => {
  it("always assembles parts in reading order, whatever order they were chosen", () => {
    expect(composeIntroPrompt(["format", "task", "role"])).toBe("Act as a biology tutor. Explain photosynthesis. Use five numbered steps.");
    expect(composeIntroPrompt([])).toBe("");
  });

  it("suggests the first missing part and confirms a complete prompt", () => {
    expect(nextIntroHint(["task"])).toBe(introPromptParts[0].hint);
    expect(nextIntroHint(introPromptParts.map((part) => part.id))).toBe("All five parts. Specific enough to be useful.");
  });

  it("builds automatically from the task outward while the learner scrolls", () => {
    expect(autoIntroParts(1)).toEqual(["task"]);
    expect(autoIntroParts(3)).toEqual(["task", "role", "context"]);
    expect(autoIntroParts(9)).toHaveLength(5);
    expect(autoPartCount(2.2, 1, 3)).toBe(1);
    expect(autoPartCount(3, 0, 3)).toBe(1);
    expect(autoPartCount(3, 0.5, 3)).toBe(3);
    expect(autoPartCount(3, 1, 3)).toBe(5);
    expect(autoPartCount(3.8, 1, 3)).toBe(5);
    expect(introPromptParts.reduce((total, part) => total + part.tokens, 0)).toBe(24);
  });
});
