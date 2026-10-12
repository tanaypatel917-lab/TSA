export const diceTasks = [
  { text: "Explain photosynthesis", keywords: ["photosynthesis"] },
  { text: "Summarize the causes of World War I", keywords: ["world war", "wwi", "ww1"] },
  { text: "Plan a 3-day study schedule for a math test", keywords: ["study", "schedule"] },
  { text: "Write a thank-you note to a coach", keywords: ["thank"] },
  { text: "Explain how a vaccine works", keywords: ["vaccine"] },
  { text: "Compare renting and buying a bike", keywords: ["bike"] }
] as const;

export const diceAudiences = [
  { text: "to a 10-year-old", keywords: ["10", "ten", "kid", "child"] },
  { text: "to your grandparent", keywords: ["grandparent", "grandma", "grandpa", "grandmother", "grandfather"] },
  { text: "to a classmate who missed the lesson", keywords: ["missed", "classmate"] },
  { text: "to someone learning English", keywords: ["english learner", "simple english", "learning english", "esl"] },
  { text: "to a teacher", keywords: ["teacher"] },
  { text: "to a sports team", keywords: ["team", "players"] }
] as const;

export const diceConstraints = [
  { text: "in 3 sentences", keywords: ["3 sentences", "three sentences"] },
  { text: "with no jargon", keywords: ["jargon", "simple words", "plain"] },
  { text: "as a numbered list", keywords: ["numbered", "list", "steps"] },
  { text: "in under 50 words", keywords: ["50 words", "fifty words"] },
  { text: "with one real-life example", keywords: ["example"] },
  { text: "ending with a question", keywords: ["question"] }
] as const;

export type DiceRoll = { task: number; audience: number; constraint: number };
export type DiceCheckId = "task" | "audience" | "constraint" | "role" | "detail";
export type DiceCheck = { id: DiceCheckId; label: string; passed: boolean };

const dieKeys = ["task", "audience", "constraint"] as const;

export function rollDice(current: DiceRoll, rng: () => number = Math.random): DiceRoll {
  const next = {
    task: Math.min(diceTasks.length - 1, Math.floor(rng() * diceTasks.length)),
    audience: Math.min(diceAudiences.length - 1, Math.floor(rng() * diceAudiences.length)),
    constraint: Math.min(diceConstraints.length - 1, Math.floor(rng() * diceConstraints.length))
  };

  if (dieKeys.every((key) => next[key] === current[key])) {
    next.task = (next.task + 1) % diceTasks.length;
  }

  return next;
}

export function promptDiceChallenge(roll: DiceRoll): string {
  return `${diceTasks[roll.task].text} ${diceAudiences[roll.audience].text} ${diceConstraints[roll.constraint].text}`;
}

function matchesKeyword(prompt: string, keyword: string): boolean {
  const normalizedPrompt = prompt.toLowerCase().replace(/\s+/g, " ").trim();
  const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, " ").trim();
  if (/\s/.test(normalizedKeyword)) return normalizedPrompt.includes(normalizedKeyword);

  const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escapedKeyword}\\b`).test(normalizedPrompt);
}

export function checkPrompt(prompt: string, roll: DiceRoll): DiceCheck[] {
  const task = diceTasks[roll.task];
  const audience = diceAudiences[roll.audience];
  const constraint = diceConstraints[roll.constraint];
  const normalized = prompt.trim();
  const wordCount = normalized ? normalized.split(/\s+/).length : 0;

  return [
    { id: "task", label: "Names the task", passed: task.keywords.some((keyword) => matchesKeyword(prompt, keyword)) },
    { id: "audience", label: "Says who it's for", passed: audience.keywords.some((keyword) => matchesKeyword(prompt, keyword)) },
    { id: "constraint", label: "Sets the limit", passed: constraint.keywords.some((keyword) => matchesKeyword(prompt, keyword)) },
    { id: "role", label: "Gives the AI a role", passed: /\b(act as|you are|as a)\b/i.test(prompt) },
    { id: "detail", label: "Enough detail (12+ words)", passed: wordCount >= 12 }
  ];
}

export function diceMeterText(passed: number): string {
  if (passed <= 2) return "Vague: the AI has to guess.";
  if (passed <= 4) return "Better: say who it's for and set a limit.";
  return "Specific: a challenge you can check.";
}
