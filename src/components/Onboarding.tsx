"use client";

import { useState } from "react";
import Link from "next/link";
import { modules } from "@/content";
import { ONBOARDING_STATEMENTS } from "@/content/onboarding";
import { todayKey } from "@/engine/dates";
import { useProgress } from "@/state/ProgressProvider";

const GOALS = [
  { value: 1 as const, label: "Casual", detail: "1 activity a day" },
  { value: 2 as const, label: "Regular", detail: "2 activities a day" },
  { value: 3 as const, label: "Serious", detail: "3 activities a day" }
];

const START_MODULES = ["foundations", "tools", "ethics"];

export function Onboarding() {
  const { dispatch } = useProgress();
  const [step, setStep] = useState(0);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [goal, setGoal] = useState<1 | 2 | 3>(2);
  const [startModule, setStartModule] = useState("foundations");
  const [finished, setFinished] = useState(false);

  const recommended = correct <= 3 ? "foundations" : "tools";
  const chosenModule = modules.find((module) => module.id === startModule) ?? modules[0];
  const statement = ONBOARDING_STATEMENTS[index];

  function answer(guessFact: boolean) {
    if (answered !== null) return;
    const right = guessFact === statement.isFact;
    setAnswered(right);
    if (right) setCorrect((value) => value + 1);
  }

  function nextStatement() {
    if (index === ONBOARDING_STATEMENTS.length - 1) {
      setStep(1);
    } else {
      setIndex((value) => value + 1);
      setAnswered(null);
    }
  }

  function finish(skipped = false) {
    dispatch({
      type: "onboarding-completed",
      day: todayKey(),
      dailyGoal: skipped ? 2 : goal,
      startModule: skipped ? "foundations" : startModule,
      correct: skipped ? 0 : correct,
      skipped
    });
    setFinished(true);
  }

  return (
    <div className="shell py-12 sm:py-20">
      <p className="eyebrow">AI Compass · grades 9–12</p>
      <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight sm:text-7xl">Find your way through the world of AI.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Learn how AI works, practice smart prompts, make responsible choices, and design a project you can defend.</p>

      <div className="card mt-10 max-w-2xl">
        {finished ? (
          <div>
            <p className="eyebrow">Calibrate your compass</p>
            <h2 className="mt-2 text-2xl font-black">Your compass is calibrated 🧭</h2>
            <p className="mt-3 text-slate-600">Start with your first lesson and earn XP as you go. Your progress stays on this device.</p>
            <Link href={`/modules/${chosenModule.slug}/lessons/${chosenModule.lessons[0].id}`} className="button-primary mt-5">
              Start {chosenModule.title} →
            </Link>
          </div>
        ) : step === 0 ? (
          <div>
            <p className="eyebrow">Calibrate your compass · myth or fact {index + 1}/{ONBOARDING_STATEMENTS.length}</p>
            <h2 className="mt-2 text-2xl font-black">{statement.statement}</h2>
            <div className="mt-5 flex gap-3">
              <button onClick={() => answer(false)} disabled={answered !== null} className="button-secondary">Myth</button>
              <button onClick={() => answer(true)} disabled={answered !== null} className="button-secondary">Fact</button>
            </div>
            {answered !== null && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-bold">{answered ? "That's right!" : "Not quite — and that's the point of calibrating."}</p>
                <p className="mt-1">{statement.explanation}</p>
                <button onClick={nextStatement} className="button-primary mt-3">{index === ONBOARDING_STATEMENTS.length - 1 ? "Continue" : "Next"}</button>
              </div>
            )}
            <button onClick={() => finish(true)} className="mt-5 text-sm font-semibold text-slate-500 underline-offset-2 hover:text-accent hover:underline">Skip for now</button>
          </div>
        ) : step === 1 ? (
          <div>
            <p className="eyebrow">Calibrate your compass · step 2 of 3</p>
            <h2 className="mt-2 text-2xl font-black">Pick a daily goal</h2>
            <p className="mt-2 text-sm text-slate-600">A gentle target, not a requirement. You can always do more or less.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {GOALS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setGoal(option.value); setStep(2); }}
                  className={`rounded-2xl border p-4 text-left transition ${goal === option.value ? "border-accent" : "border-slate-200"} hover:border-accent`}
                >
                  <span className="block font-black">{option.label}</span>
                  <span className="mt-1 block text-sm text-slate-600">{option.detail}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="eyebrow">Calibrate your compass · step 3 of 3</p>
            <h2 className="mt-2 text-2xl font-black">Where should we point first?</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {START_MODULES.map((id) => {
                const entry = modules.find((item) => item.id === id);
                if (!entry) return null;
                return (
                  <button
                    key={id}
                    onClick={() => { setStartModule(id); finish(); }}
                    className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-accent"
                  >
                    <span className="text-2xl">{entry.icon}</span>
                    <span className="mt-2 block font-black">{entry.title}</span>
                    {id === recommended && <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">Recommended</span>}
                    <span className="mt-1 block text-sm text-slate-600">{entry.tagline}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
