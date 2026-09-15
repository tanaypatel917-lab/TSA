"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function Scenarios({ activity, moduleId }: { activity: Extract<Activity, { kind: "scenarios" }>; moduleId: string }) {
  const { dispatch } = useProgress();
  const [index, setIndex] = useState(0); const [feedback, setFeedback] = useState<string | null>(null); const [done, setDone] = useState(false);
  const scenario = activity.scenarios[index];
  function choose(option: { ok: boolean; feedback: string }) { setFeedback(option.feedback); }
  function next() { if (index === activity.scenarios.length - 1) { setDone(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); } else { setIndex((value) => value + 1); setFeedback(null); } }
  if (done) return (
    <div className="terminal frame p-8 sm:p-12">
      <p className="mono-label">:// Scenarios complete</p>
      <h2 className="display-lg mt-6 text-paper">You practiced responsible choices<span className="text-signal">.</span></h2>
    </div>
  );
  return (
    <div className="card">
      <div className="flex items-center justify-between"><p className="eyebrow">Scenario {index + 1} of {activity.scenarios.length}</p><span className="index">{activity.title}</span></div>
      <h2 className="display-sm mt-6 normal-case tracking-tight">{scenario.situation}</h2>
      <div className="mt-8 grid gap-2">{scenario.options.map((option, i) => <button key={option.text} className="choice" onClick={() => choose(option)} disabled={!!feedback}><span aria-hidden="true" className="index mr-3 inline-block w-6">{String.fromCharCode(65 + i)}</span>{option.text}</button>)}</div>
      {feedback && <div className="mt-8 border-t border-ink pt-6"><p className="text-base leading-relaxed">{feedback}</p><button className="button-primary mt-5" onClick={next}>{index === activity.scenarios.length - 1 ? "Finish" : "Next scenario"} <span aria-hidden="true">→</span></button></div>}
    </div>
  );
}
