export type FigureKind = "system" | "rules" | "chatbot" | "tokens" | "predictor" | "bias" | "claims" | "prompt" | "dice" | "vary" | "redact" | "fakepage" | "jury" | "detector";

export const lessonFigures: Record<string, { after: number; kind: FigureKind }[]> = {
  "foundations/what-is-ai": [{ after: 0, kind: "system" }],
  "foundations/rules-and-learning": [{ after: 1, kind: "rules" }, { after: 2, kind: "chatbot" }],
  "foundations/language-models": [{ after: 0, kind: "tokens" }, { after: 2, kind: "predictor" }],
  "foundations/data-and-bias": [{ after: 1, kind: "bias" }],
  "foundations/strengths-and-limits": [{ after: 2, kind: "claims" }],
  "tools/prompt-anatomy": [{ after: 1, kind: "prompt" }, { after: 3, kind: "dice" }],
  "tools/iterate-verify": [{ after: 0, kind: "vary" }],
  "ethics/privacy": [{ after: 0, kind: "redact" }],
  "ethics/fairness": [{ after: 0, kind: "jury" }],
  "ethics/academic-integrity": [{ after: 1, kind: "detector" }],
  "ethics/misinformation": [{ after: 1, kind: "fakepage" }]
};
