import type { Activity } from "@/content/types";

type Rubric = Extract<Activity, { kind: "prompt-lab" }>["rubric"];

export function evaluatePrompt(text: string, rubric: Rubric) {
  const normalized = text.toLowerCase();
  const checks = rubric.map((rule) => ({ ...rule, ok: rule.keywords.some((word) => normalized.includes(word)) }));
  const score = checks.filter((rule) => rule.ok).length;
  return { checks, score, ready: score >= 4 };
}
