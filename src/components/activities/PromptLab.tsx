"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function PromptLab({ activity, moduleId }: { activity: Extract<Activity, { kind: "prompt-lab" }>; moduleId: string }) {
  const { dispatch } = useProgress();
  const [text, setText] = useState("");
  const [completed, setCompleted] = useState(false);
  const checks = activity.rubric.map((rule) => ({ ...rule, ok: rule.keywords.some((word) => text.toLowerCase().includes(word)) }));
  const score = checks.filter((rule) => rule.ok).length;
  function complete() { if (score >= 4 && !completed) { setCompleted(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); } }
  return (
    <div className="card">
      <div className="flex items-center justify-between"><p className="eyebrow">Rewrite and test</p><span className="index">{score}/{checks.length} rubric</span></div>
      <h2 className="display-md mt-4">{activity.title}</h2><p className="mt-4 text-base leading-relaxed text-mute">{activity.intro}</p>
      <div className="terminal frame mt-8 p-5 sm:p-6"><p className="mono-label">:// weak prompt</p><p className="mt-3 font-display text-lg text-paper">{activity.weakPrompt}</p></div>
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={6} className="field mt-6" placeholder="Write a clearer prompt..." aria-label="Your improved prompt" />
      <ul className="mt-4 grid gap-px border border-ink bg-ink sm:grid-cols-5">{checks.map((rule) => <li key={rule.id} className={`mono-label p-3 text-center ${rule.ok ? "bg-ink text-paper" : "bg-paper text-mute"}`}><span aria-hidden="true" className={rule.ok ? "text-signal" : ""}>{rule.ok ? "■" : "□"}</span> {rule.label}</li>)}</ul>
      <p className="mt-6 font-display text-base font-bold">{score}/5 rubric points — {score >= 4 ? "Ready to complete!" : "Add details to reach 4/5."}</p>
      <button className="button-primary mt-4" onClick={complete} disabled={score < 4 || completed}>{completed ? "Activity complete" : "Complete prompt lab"}</button>
    </div>
  );
}
