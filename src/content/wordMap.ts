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

const TETRAHEDRON = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1]
] as const;

const CENTER_COMPONENT = 2.2 / Math.sqrt(3);

function centerFor(vertex: readonly [number, number, number]) {
  return [
    vertex[0] * CENTER_COMPONENT,
    vertex[1] * CENTER_COMPONENT,
    vertex[2] * CENTER_COMPONENT
  ] as const;
}

export const WORD_MAP_GROUP_CENTERS = {
  models: centerFor(TETRAHEDRON[0]),
  data: centerFor(TETRAHEDRON[1]),
  use: centerFor(TETRAHEDRON[2]),
  risks: centerFor(TETRAHEDRON[3])
} satisfies Record<WordMapGroupId, readonly [number, number, number]>;
