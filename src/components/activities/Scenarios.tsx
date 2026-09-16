"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function Scenarios({ activity, moduleId }: { activity: Extract<Activity, { kind: "scenarios" }>; moduleId: string }) {
  const { dispatch } = useProgress();
  const [index, setIndex] = useState(0); const [feedback, setFeedback] = useState<string | null>(null); const [done, setDone] = useState(false);
  const scenario = activity.scenarios[index];
  function choose(option: { ok: boolean; feedback: string }) { setFeedback(option.feedback); }
  function next() { if (index === activity.scenarios.length - 1) { setDone(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); } else { setIndex((value) => value + 1); setFeedback(null); } }
  if (done) return <div className="card"><p className="eyebrow">Scenarios complete</p><h2 className="mt-2 text-2xl font-bold">You practiced responsible choices.</h2></div>;
  return <div className="card"><p className="eyebrow">Scenario {index + 1} of {activity.scenarios.length}</p><h2 className="mt-2 text-2xl font-bold">{activity.title}</h2><p className="mt-5 text-lg">{scenario.situation}</p>
    <Stagger className="mt-5 grid gap-3">{scenario.options.map((option) => <StaggerItem key={option.text}><button className="button-secondary w-full text-left" onClick={() => choose(option)} disabled={!!feedback}>{option.text}</button></StaggerItem>)}</Stagger>
    {feedback && <div className="mt-5 rounded-xl bg-indigo-50 p-4 text-indigo-950"><p>{feedback}</p><button className="button-primary mt-3" onClick={next}>{index === activity.scenarios.length - 1 ? "Finish" : "Next scenario"}</button></div>}
  </div>;
}
