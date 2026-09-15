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
  return <div className="card">
    <p className="eyebrow">Rewrite and test</p><h2 className="mt-2 text-2xl font-bold">{activity.title}</h2><p className="mt-2 text-slate-600">{activity.intro}</p>
    <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><strong>Weak prompt:</strong> {activity.weakPrompt}</p>
    <textarea value={text} onChange={(event) => setText(event.target.value)} rows={6} className="mt-5 w-full rounded-xl border-slate-300" placeholder="Write a clearer prompt..." aria-label="Your improved prompt" />
    <div className="mt-4 grid gap-2 sm:grid-cols-5">{checks.map((rule) => <div key={rule.id} className={`rounded-xl p-3 text-center text-sm ${rule.ok ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}><span>{rule.ok ? "✓" : "○"}</span> {rule.label}</div>)}</div>
    <p className="mt-4 font-semibold">{score}/5 rubric points — {score >= 4 ? "Ready to complete!" : "Add details to reach 4/5."}</p>
    <button className="button-primary mt-4" onClick={complete} disabled={score < 4 || completed}>{completed ? "Activity complete" : "Complete prompt lab"}</button>
  </div>;
}
