export type FigureKind = "system" | "rules" | "tokens" | "predictor" | "bias" | "claims" | "prompt" | "vary" | "redact";

export const lessonFigures: Record<string, { after: number; kind: FigureKind }[]> = {
  "foundations/what-is-ai": [{ after: 0, kind: "system" }],
  "foundations/rules-and-learning": [{ after: 1, kind: "rules" }],
  "foundations/language-models": [{ after: 0, kind: "tokens" }, { after: 2, kind: "predictor" }],
  "foundations/data-and-bias": [{ after: 1, kind: "bias" }],
  "foundations/strengths-and-limits": [{ after: 2, kind: "claims" }],
  "tools/prompt-anatomy": [{ after: 1, kind: "prompt" }],
  "tools/iterate-verify": [{ after: 0, kind: "vary" }],
  "ethics/privacy": [{ after: 0, kind: "redact" }]
};
