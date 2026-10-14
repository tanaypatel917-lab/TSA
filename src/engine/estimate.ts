import type { QuizQuestion } from "../content/types";

export function estimateChoice(question: QuizQuestion, value: number): number {
  const estimate = question.estimate;
  if (!estimate) throw new Error(`Quiz question ${question.id} does not have an estimate slider.`);
  if (Math.abs(value - estimate.answer) <= estimate.tolerance) return question.answerIndex;

  let nearestIndex = -1;
  let nearestDistance = Infinity;
  question.choices.forEach((choice, index) => {
    if (index === question.answerIndex) return;
    const number = choice.match(/\d[\d,]*(?:\.\d+)?/);
    if (!number) return;
    const distance = Math.abs(Number(number[0].replace(/,/g, "")) - value);
    if (distance < nearestDistance) {
      nearestIndex = index;
      nearestDistance = distance;
    }
  });

  if (nearestIndex === -1) throw new Error(`Quiz question ${question.id} has no numeric wrong-answer choices.`);
  return nearestIndex;
}
