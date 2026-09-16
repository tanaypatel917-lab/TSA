"use client";

import { useMemo, useState } from "react";
import { modules } from "@/content";
import { pickDailyQuestions } from "@/engine/daily";
import { todayKey } from "@/engine/dates";
import { useProgress } from "@/state/ProgressProvider";
import { BorderBeam } from "@/components/magicui/BorderBeam";

export function DailyChallenge() {
  const { state, dispatch, hydrated } = useProgress();
  const today = todayKey();
  const questions = useMemo(() => pickDailyQuestions(today, modules), [today]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  if (!hydrated) return null;

  if (state.dailyChallenge.lastDay === today || done) {
    return (
      <div className="relative overflow-hidden border border-line bg-paper p-7">
        <BorderBeam colorFrom="#b02a08" colorTo="#c8f560" />
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Today&rsquo;s Compass Check</p>
            <h2 className="mt-3 font-display text-3xl italic">Done for today — come back tomorrow for a new check. 🧭</h2>
            {done && <p className="mt-2 text-ink/75">You got {correct}/{questions.length} correct — every answer taught you something.</p>}
          </div>
          <span className="text-3xl">✅</span>
        </div>
      </div>
    );
  }

  const current = questions[index];

  function choose(choiceIndex: number) {
    if (picked !== null) return;
    setPicked(choiceIndex);
    if (choiceIndex === current.question.answerIndex) setCorrect((value) => value + 1);
  }

  function next() {
    if (index === questions.length - 1) {
      dispatch({ type: "daily-challenge-completed", day: today, correct });
      setDone(true);
    } else {
      setIndex((value) => value + 1);
      setPicked(null);
    }
  }

  return (
    <div className="relative overflow-hidden border border-line bg-paper p-7">
      <BorderBeam colorFrom="#b02a08" colorTo="#c8f560" />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="eyebrow">Today&rsquo;s Compass Check</p>
          <h2 className="mt-3 font-display text-3xl italic">Question {index + 1} of {questions.length}</h2>
        </div>
        <span className="rounded-full border border-lime bg-lime px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider">+15 XP</span>
      </div>
      <p className="mt-5 font-bold text-ink">{current.question.prompt}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {current.question.choices.map((choice, choiceIndex) => {
          const isAnswer = choiceIndex === current.question.answerIndex;
          const isPicked = choiceIndex === picked;
          let classes = "button-secondary justify-start text-left";
          if (picked !== null) {
            if (isAnswer) classes += " !border-lime !bg-lime";
            else if (isPicked) classes += " !border-accent !text-accent";
          }
          return (
            <button key={choiceIndex} onClick={() => choose(choiceIndex)} disabled={picked !== null} className={classes}>
              {choice}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-4 border border-line bg-paper/60 p-4 text-sm text-ink/70">
          <p className="font-bold text-ink">{picked === current.question.answerIndex ? "Nice — that's right." : "Not quite — good thing this is practice."}</p>
          <p className="mt-1">{current.question.explanation}</p>
          <button onClick={next} className="btn-pill mt-3">{index === questions.length - 1 ? "See results" : "Next question"}</button>
        </div>
      )}
      <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ink/75">Three quick questions, new every day. Answering counts — the XP is yours either way.</p>
    </div>
  );
}
