"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Module } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function QuizRunner({ module }: { module: Module }) {
  const { state, dispatch, hydrated, storageError } = useProgress();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const chosenIndex = useRef<number | null>(null);
  const advancedIndex = useRef<number | null>(null);
  const moveFocus = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = module.quiz[index];
  const selected = answers[index];
  const correctCount = answers.filter((answer, position) => answer === module.quiz[position].answerIndex).length;
  const score = Math.round(correctCount / module.quiz.length * 100);
  const incorrect = module.quiz.map((item, position) => ({ question: item, answer: answers[position], position })).filter((item) => item.answer !== item.question.answerIndex);

  useEffect(() => {
    if (moveFocus.current) { heading.current?.focus(); moveFocus.current = false; }
  }, [index, finished]);

  function choose(choice: number) {
    if (!hydrated || finished || chosenIndex.current === index) return;
    chosenIndex.current = index;
    setAnswers((current) => [...current, choice]);
  }
  function next() {
    if (!hydrated || selected === undefined || finished || advancedIndex.current === index) return;
    advancedIndex.current = index;
    moveFocus.current = true;
    if (index === module.quiz.length - 1) {
      dispatch({ type: "quiz-completed", moduleId: module.id, scorePct: score, day: todayKey() });
      setFinished(true);
    } else { setIndex((value) => value + 1); }
  }
  function retry() {
    chosenIndex.current = null;
    advancedIndex.current = null;
    moveFocus.current = true;
    setAnswers([]);
    setIndex(0);
    setFinished(false);
  }

  if (finished) return <section className="quiz-results"><div className="result-top"><div><p className="eyebrow">Quiz complete</p><h2 ref={heading} tabIndex={-1}>{score}%</h2><p>{correctCount} of {module.quiz.length} correct this time.</p><ol className="answer-strip" aria-label="Your answers">{module.quiz.map((item, position) => { const right = answers[position] === item.answerIndex; return <li key={item.id} data-correct={right}><span>Q{position + 1}</span><strong>{right ? "Right" : "Missed"}</strong></li>; })}</ol></div><div className="result-detail"><p className="result-best">{storageError ? "Best score this session" : "Saved best score"}: {state.quizBest[module.id] ?? 0}%</p><p>{score >= 80 ? "Strong work. Keep asking why an answer holds up." : "Every missed question is a useful place to start again."}</p><div className="result-actions"><button className="button-secondary" onClick={retry}>Retry quiz</button><Link className="button-primary" href={`/modules/${module.slug}`}>Back to module</Link></div></div></div>{storageError && <p className="storage-warning" role="status">{storageError}</p>}<div className="quiz-review"><h3>{incorrect.length ? "A second look." : "You’ve got the foundations."}</h3>{incorrect.length ? <><p className="mt-3">Revisit the ideas behind the answers you missed.</p><ol>{incorrect.map(({ question: item, answer, position }) => <li key={item.id}><h4>{position + 1}. {item.prompt}</h4><p className="review-choice">Your answer: {item.choices[answer]}</p><p><strong>Correct answer:</strong> {item.choices[item.answerIndex]}</p><p>{item.explanation}</p></li>)}</ol></> : <p className="mt-3">You answered every question correctly. Try explaining one idea to someone else, in your own words.</p>}<Link href={`/modules/${module.slug}`} className="text-link">Review the lessons <span aria-hidden="true">↗</span></Link></div></section>;

  return <div className="quiz-layout"><aside className="quiz-aside"><p>Question {index + 1} of {module.quiz.length}</p><div className="quiz-count" aria-hidden="true">{String(index + 1).padStart(2, "0")}<span>/{String(module.quiz.length).padStart(2, "0")}</span></div><p>{correctCount} correct so far</p><div className="quiz-steps" aria-hidden="true">{module.quiz.map((item, position) => <i key={item.id} data-reached={position <= index} />)}</div></aside><section className="quiz-main"><h2 ref={heading} tabIndex={-1}>{question.prompt}</h2><div className="answer-list">{question.choices.map((choice, choiceIndex) => {
    const status = selected === undefined ? "unanswered" : choiceIndex === question.answerIndex ? "correct" : choiceIndex === selected ? "incorrect" : "unselected";
    const statusText = status === "correct" ? "Correct" : status === "incorrect" ? "Incorrect" : status === "unselected" ? "Not selected" : "";
    return <button key={`${question.id}-${choiceIndex}`} className="answer-choice" data-state={status} aria-pressed={choiceIndex === selected} disabled={!hydrated || selected !== undefined} onClick={() => choose(choiceIndex)}><span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + choiceIndex)}</span><span>{choice}</span>{statusText && <span className="answer-status">{statusText}</span>}</button>;
  })}</div>{selected !== undefined && <div className="answer-feedback"><div role="status" aria-live="polite"><strong>{selected === question.answerIndex ? "Correct!" : "Not quite."}</strong><p>{question.explanation}</p>{selected !== question.answerIndex && <p className="small-note mt-2">Correct answer: {question.choices[question.answerIndex]}</p>}</div><button className="button-primary" onClick={next}>{index === module.quiz.length - 1 ? "See results" : "Next question"}</button></div>}{storageError && <p className="storage-warning" role="status">{storageError}</p>}</section></div>;
}
