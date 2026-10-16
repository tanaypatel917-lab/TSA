export type FigureKind = "system" | "rules" | "chatbot" | "tokens" | "predictor" | "bias" | "train" | "launch-day" | "claims" | "prompt" | "dice" | "vary" | "redact" | "fakepage" | "jury" | "detector" | "cookies";

export const figureLabels: Record<FigureKind, string> = {
  system: "AI system map",
  rules: "Spam rule writer",
  chatbot: "Menu chatbot",
  tokens: "Text tokenizer",
  predictor: "Next-word predictor",
  bias: "Biased fruit sorter",
  train: "Sorting line trainer",
  "launch-day": "Launch-day choices",
  claims: "Hallucination checker",
  prompt: "Prompt builder",
  dice: "Prompt dice challenge",
  vary: "Three answer variations",
  redact: "Privacy redactor",
  fakepage: "Fake-page fact check",
  jury: "Model fairness panel",
  detector: "Detector accuracy check",
  cookies: "Cookie privacy check"
};

export const lessonFigures: Record<string, { after: number; kind: FigureKind }[]> = {
  "foundations/what-is-ai": [{ after: 0, kind: "system" }],
  "foundations/rules-and-learning": [{ after: 1, kind: "rules" }, { after: 1, kind: "train" }, { after: 2, kind: "chatbot" }],
  "foundations/language-models": [{ after: 0, kind: "tokens" }, { after: 2, kind: "predictor" }],
  "foundations/data-and-bias": [{ after: 1, kind: "bias" }],
  "foundations/strengths-and-limits": [{ after: 2, kind: "claims" }],
  "tools/prompt-anatomy": [{ after: 1, kind: "prompt" }, { after: 3, kind: "dice" }],
  "tools/iterate-verify": [{ after: 0, kind: "vary" }],
  "ethics/privacy": [{ after: 0, kind: "redact" }, { after: 1, kind: "cookies" }],
  "ethics/fairness": [{ after: 0, kind: "jury" }],
  "ethics/academic-integrity": [{ after: 1, kind: "detector" }],
  "ethics/misinformation": [{ after: 1, kind: "fakepage" }],
  "capstone/responsible-launch": [{ after: 0, kind: "launch-day" }]
};
