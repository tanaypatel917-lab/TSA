"use client";
import Link from "next/link";
import { useState } from "react";
import type { Module } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function QuizRunner({ module }: { module: Module }) {
  const { dispatch } = useProgress(); const [index, setIndex] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [score, setScore] = useState(0); const [finished, setFinished] = useState(false); const question = module.quiz[index];
  function choose(choice: number) { if (selected !== null) return; setSelected(choice); if (choice === question.answerIndex) setScore((value) => value + 1); }
  function next() { if (index === module.quiz.length - 1) { dispatch({ type: "quiz-completed", moduleId: module.id, scorePct: score / module.quiz.length * 100, day: todayKey() }); setFinished(true); } else { setIndex((value) => value + 1); setSelected(null); } }
  function retry() { setIndex(0); setSelected(null); setScore(0); setFinished(false); }
  if (finished) return <div className="card text-center"><p className="eyebrow">Quiz complete</p><h2 className="mt-3 text-5xl font-black">{Math.round(score / module.quiz.length * 100)}%</h2><p className="mt-3 text-slate-600">{score / module.quiz.length >= 0.7 ? "Strong work. Your best score is now saved." : "Review the lessons and try again when you are ready."}</p><div className="mt-6 flex justify-center gap-3"><button className="button-secondary" onClick={retry}>Retry quiz</button><Link className="button-primary" href={`/modules/${module.slug}`}>Back to module</Link></div></div>;
  return <div className="card"><div className="flex items-center justify-between"><p className="eyebrow font-mono">Question {index + 1} of {module.quiz.length}</p><span className="font-mono text-sm font-bold text-slate-500">{score} correct</span></div><h2 className="mt-5 text-2xl font-bold">{question.prompt}</h2><div className="mt-6 grid gap-3">{question.choices.map((choice, choiceIndex) => { const chosen = selected === choiceIndex; const correct = selected !== null && choiceIndex === question.answerIndex; return <button key={choice} className={`rounded-xl border p-4 text-left font-semibold transition ${correct ? "border-emerald-500 bg-emerald-50" : chosen ? "border-rose-500 bg-rose-50" : "border-slate-200 hover:border-accent"}`} onClick={() => choose(choiceIndex)}>{choice}</button>; })}</div>{selected !== null && <div className="mt-6 rounded-xl bg-slate-100 p-4"><p className="font-bold">{selected === question.answerIndex ? "Correct!" : "Not quite."}</p><p className="mt-1 text-sm text-slate-700">{question.explanation}</p><button className="button-primary mt-4" onClick={next}>{index === module.quiz.length - 1 ? "See results" : "Next question"}</button></div>}</div>;
}
