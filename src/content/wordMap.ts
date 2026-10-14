export const WORD_MAP_GROUPS = [
  {
    id: "models",
    label: "How models work",
    tone: "sky",
    terms: ["AI", "Machine learning", "Model", "LLM", "Token", "Algorithm", "Classifier", "Generative AI"]
  },
  {
    id: "data",
    label: "Data and fairness",
    tone: "clay",
    terms: ["Training data", "Bias", "Fairness", "Privacy"]
  },
  {
    id: "use",
    label: "Using AI well",
    tone: "lake",
    terms: ["Prompt", "Context", "Verification", "Human oversight"]
  },
  {
    id: "risks",
    label: "Risks to watch",
    tone: "ink",
    terms: ["Hallucination", "Deepfake", "Misinformation", "Prompt injection"]
  }
] as const;

export type WordMapGroup = (typeof WORD_MAP_GROUPS)[number];
export type WordMapGroupId = WordMapGroup["id"];
export type WordMapTone = WordMapGroup["tone"];

export const WORD_MAP_GROUP_CENTERS = {
  models: [-1.6, 0.9, 0.3],
  use: [1.6, 0.9, -0.3],
  risks: [-1.6, -1.1, -0.3],
  data: [1.6, -1.1, 0.3]
} as const satisfies Record<WordMapGroupId, readonly [number, number, number]>;
