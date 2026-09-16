"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function Classifier({ activity, moduleId }: { activity: Extract<Activity, { kind: "classifier" }>; moduleId: string }) {
  const { dispatch } = useProgress();
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const item = activity.items[index];
  function answer(label: "spam" | "not-spam") {
    if (choice || done) return;
    const nextCorrect = correct + (label === item.label ? 1 : 0);
    setCorrect(nextCorrect);
    setChoice(label);
    if (index === activity.items.length - 1) {
      setDone(true);
      dispatch({ type: "activity-completed", moduleId, day: todayKey() });
    } else {
      window.setTimeout(() => { setIndex((value) => value + 1); setChoice(null); }, 500);
    }
  }
  if (done) return <div className="card"><p className="eyebrow">Classifier complete</p><h2 className="mt-2 text-2xl font-bold">You scored {correct}/{activity.items.length}</h2><p className="mt-2 text-slate-600">A real classifier would need many examples and careful testing.</p></div>;
  return <div className="card">
    <p className="eyebrow">Message {index + 1} of {activity.items.length}</p>
    <h2 className="mt-2 text-2xl font-bold">{activity.title}</h2><p className="mt-2 text-slate-600">{activity.intro}</p>
    <p className="my-8 rounded-2xl bg-slate-100 p-5 text-lg font-medium">{item.text}</p>
    <Stagger className="grid gap-3 sm:grid-cols-2">
      <StaggerItem><button className="button-secondary w-full" onClick={() => answer("spam")} disabled={!!choice}>Spam</button></StaggerItem>
      <StaggerItem><button className="button-secondary w-full" onClick={() => answer("not-spam")} disabled={!!choice}>Not spam</button></StaggerItem>
    </Stagger>
    {choice && <p className="mt-4 font-semibold">{choice === item.label ? "Correct — nice pattern spotting." : `Not quite. This was ${item.label}.`}</p>}
  </div>;
}
