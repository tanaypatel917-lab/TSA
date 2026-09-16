"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { modules } from "@/content";
import { ONBOARDING_STATEMENTS } from "@/content/onboarding";
import { todayKey } from "@/engine/dates";
import { useProgress } from "@/state/ProgressProvider";
import { Hero, LearningPath } from "@/components/Hero";

const GOALS = [
  { value: 1 as const, label: "Casual", detail: "1 activity a day" },
  { value: 2 as const, label: "Regular", detail: "2 activities a day" },
  { value: 3 as const, label: "Serious", detail: "3 activities a day" }
];

const START_MODULES = ["foundations", "tools", "ethics"];

export function Onboarding() {
  const { dispatch } = useProgress();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [goal, setGoal] = useState<1 | 2 | 3>(2);
  const [startModule, setStartModule] = useState("foundations");

  const recommended = correct <= 3 ? "foundations" : "tools";
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

  function finish(skipped = false, moduleId?: string) {
    const moduleChoice = skipped ? "foundations" : (moduleId ?? startModule);
    dispatch({
      type: "onboarding-completed",
      day: todayKey(),
      dailyGoal: skipped ? 2 : goal,
      startModule: moduleChoice,
      correct: skipped ? 0 : correct,
      skipped
    });
    if (skipped) return;
    const chosen = modules.find((item) => item.id === moduleChoice) ?? modules[0];
    router.push(`/modules/${chosen.slug}/lessons/${chosen.lessons[0].id}`);
  }

  return (
    <>
      <Hero />
      <section id="calibrate" className="shell py-24 sm:py-32">
        <div className="mx-auto max-w-2xl border border-line bg-paper p-7 sm:p-10">
          {step === 0 ? (
            <div>
              <p className="eyebrow">Calibrate your compass · myth or fact {index + 1}/{ONBOARDING_STATEMENTS.length}</p>
              <h2 className="mt-4 font-display text-4xl italic">{statement.statement}</h2>
              <div className="mt-6 flex gap-3">
                <button onClick={() => answer(false)} disabled={answered !== null} className="button-secondary">Myth</button>
                <button onClick={() => answer(true)} disabled={answered !== null} className="button-secondary">Fact</button>
              </div>
              {answered !== null && (
                <div className="mt-5 border border-line bg-paper/60 p-4 text-sm text-ink/70">
                  <p className="font-bold text-ink">{answered ? "That's right!" : "Not quite — and that's the point of calibrating."}</p>
                  <p className="mt-1">{statement.explanation}</p>
                  <button onClick={nextStatement} className="btn-pill mt-3">{index === ONBOARDING_STATEMENTS.length - 1 ? "Continue" : "Next"}</button>
                </div>
              )}
              <button onClick={() => finish(true)} className="btn-ghost mt-6">Skip for now</button>
            </div>
          ) : step === 1 ? (
            <div>
              <p className="eyebrow">Calibrate your compass · step 2 of 3</p>
              <h2 className="mt-4 font-display text-4xl italic">Pick a daily goal</h2>
              <p className="mt-3 text-sm text-ink/60">A gentle target, not a requirement. You can always do more or less.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {GOALS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setGoal(option.value); setStep(2); }}
                    className={`border p-4 text-left transition ${goal === option.value ? "border-accent" : "border-line"} hover:border-accent`}
                  >
                    <span className="block font-display text-2xl italic">{option.label}</span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-ink/60">{option.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="eyebrow">Calibrate your compass · step 3 of 3</p>
              <h2 className="mt-4 font-display text-4xl italic">Where should we point first?</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {START_MODULES.map((id) => {
                  const entry = modules.find((item) => item.id === id);
                  if (!entry) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => { setStartModule(id); finish(false, id); }}
                      className="border border-line p-4 text-left transition hover:border-accent"
                    >
                      <span className="text-2xl">{entry.icon}</span>
                      <span className="mt-2 block font-display text-xl italic">{entry.title}</span>
                      {id === recommended && <span className="mt-1 inline-block rounded-full border border-lime bg-lime px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">Recommended</span>}
                      <span className="mt-1 block text-sm text-ink/60">{entry.tagline}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
      <LearningPath />
    </>
  );
}
