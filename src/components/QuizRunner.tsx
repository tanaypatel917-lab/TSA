"use client";
import Link from "next/link";
import { useState } from "react";
import type { Module } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

const pad = (n: number) => String(n).padStart(2, "0");

export function QuizRunner({ module }: { module: Module }) {
  const { dispatch } = useProgress(); const [index, setIndex] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [score, setScore] = useState(0); const [finished, setFinished] = useState(false); const question = module.quiz[index];
  function choose(choice: number) { if (selected !== null) return; setSelected(choice); if (choice === question.answerIndex) setScore((value) => value + 1); }
  function next() { if (index === module.quiz.length - 1) { const finalScore = score + (selected === question.answerIndex ? 1 : 0); dispatch({ type: "quiz-completed", moduleId: module.id, scorePct: finalScore / module.quiz.length * 100, day: todayKey() }); setFinished(true); } else { setIndex((value) => value + 1); setSelected(null); } }
  function retry() { setIndex(0); setSelected(null); setScore(0); setFinished(false); }
  if (finished) return (
    <div className="terminal frame p-8 sm:p-12">
      <p className="mono-label">:// Quiz complete</p>
      <h2 className="display-xl mt-6 tabular-nums text-paper">{Math.round(score / module.quiz.length * 100)}%</h2>
      <p className="mt-6 max-w-md font-display text-lg text-paper">{score >= 4 ? "Strong work. Your best score is now saved." : "Review the lessons and try again when you are ready."}</p>
      <div className="mt-8 flex flex-wrap gap-3"><button className="button-secondary border-signal text-signal hover:bg-signal hover:text-ink" onClick={retry}>Retry quiz</button><Link className="button-primary border-paper bg-paper text-ink hover:border-signal hover:bg-signal" href={`/modules/${module.slug}`}>Back to module</Link></div>
    </div>
  );
  return (
    <div className="card">
      <div className="flex items-center justify-between"><p className="eyebrow">Question {pad(index + 1)} / {pad(module.quiz.length)}</p><span className="index">{score} correct</span></div>
      <div className="mt-4 flex gap-1" aria-hidden="true">{module.quiz.map((q, i) => <span key={q.id} className={`h-1 flex-1 ${i < index || (i === index && selected !== null) ? "bg-signal" : i === index ? "bg-ink" : "bg-ink/20"}`} />)}</div>
      <h2 className="display-sm mt-8 normal-case tracking-tight">{question.prompt}</h2>
      <div className="mt-8 grid gap-2">
        {question.choices.map((choice, choiceIndex) => {
          const chosen = selected === choiceIndex; const correct = selected !== null && choiceIndex === question.answerIndex;
          return <button key={choice} className={`choice ${correct ? "choice-correct" : chosen ? "choice-wrong" : ""}`} disabled={selected !== null} onClick={() => choose(choiceIndex)}><span aria-hidden="true" className="index mr-3 inline-block w-6">{String.fromCharCode(65 + choiceIndex)}</span>{choice}</button>;
        })}
      </div>
      {selected !== null && (
        <div className="mt-8 border-t border-ink pt-6">
          <p className="display-sm">{selected === question.answerIndex ? "Correct!" : "Not quite."}</p>
          <p className="mt-3 text-base leading-relaxed text-mute">{question.explanation}</p>
          <button className="button-primary mt-6" onClick={next}>{index === module.quiz.length - 1 ? "See results" : "Next question"} <span aria-hidden="true">→</span></button>
        </div>
      )}
    </div>
  );
}
