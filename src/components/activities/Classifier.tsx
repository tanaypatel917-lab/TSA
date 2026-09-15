"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

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
  if (done) return (
    <div className="terminal frame p-8 sm:p-12">
      <p className="mono-label">:// Classifier complete</p>
      <h2 className="display-xl mt-6 tabular-nums text-paper">{correct}<span className="text-signal">/</span>{activity.items.length}</h2>
      <p className="mt-6 max-w-md font-display text-lg text-paper">A real classifier would need many examples and careful testing.</p>
    </div>
  );
  return (
    <div className="card">
      <div className="flex items-center justify-between"><p className="eyebrow">Message {index + 1} of {activity.items.length}</p><span className="index">{correct} correct</span></div>
      <h2 className="display-md mt-4">{activity.title}</h2><p className="mt-4 text-base leading-relaxed text-mute">{activity.intro}</p>
      <div className="terminal frame my-10 p-6 sm:p-8">
        <p className="mono-label">:// incoming message</p>
        <p className="mt-4 font-display text-lg leading-relaxed text-paper sm:text-xl">{item.text}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button className="choice text-center" onClick={() => answer("spam")} disabled={!!choice}>Spam</button>
        <button className="choice text-center" onClick={() => answer("not-spam")} disabled={!!choice}>Not spam</button>
      </div>
      {choice && <p className="mono-label mt-6" role="status">{choice === item.label ? ":// Correct — nice pattern spotting." : `:// Not quite. This was ${item.label}.`}</p>}
    </div>
  );
}
