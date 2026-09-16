export type OnboardingStatement = {
  id: string;
  statement: string;
  isFact: boolean;
  explanation: string;
};

export const ONBOARDING_STATEMENTS: OnboardingStatement[] = [
  {
    id: "knows-when-wrong",
    statement: "AI chatbots always know when they're wrong.",
    isFact: false,
    explanation: "Myth — AI tools can give confident answers that are wrong, which is why checking sources matters."
  },
  {
    id: "learns-patterns",
    statement: "AI models learn patterns from large amounts of data.",
    isFact: true,
    explanation: "Fact — machine learning finds patterns in examples rather than following hand-written rules."
  },
  {
    id: "biased-data",
    statement: "An AI can be biased if its training data is biased.",
    isFact: true,
    explanation: "Fact — models inherit the patterns and gaps in their data, so fair data matters."
  },
  {
    id: "made-up",
    statement: "AI can generate a confident answer that is completely made up.",
    isFact: true,
    explanation: "Fact — this is called a hallucination. Confident tone doesn't mean true."
  },
  {
    id: "understands-like-people",
    statement: "AI understands the world the same way people do.",
    isFact: false,
    explanation: "Myth — AI works with statistical patterns, not lived experience or common sense."
  }
];
