"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function Capstone({ activity, moduleId }: { activity: Extract<Activity, { kind: "capstone" }>; moduleId: string }) {
  const { dispatch } = useProgress(); const [answers, setAnswers] = useState<Record<string, string>>({}); const [completed, setCompleted] = useState(false);
  const ready = activity.steps.every((step) => (answers[step.id] ?? "").trim());
  function finish() { if (ready && !completed) { setCompleted(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); } }
  function download() { const text = activity.steps.map((step) => `${step.prompt}\n${answers[step.id]}`).join("\n\n"); const url = URL.createObjectURL(new Blob([text], { type: "text/plain" })); const link = document.createElement("a"); link.href = url; link.download = "ai-compass-project-plan.txt"; link.click(); URL.revokeObjectURL(url); }
  return <div className="card"><p className="eyebrow">Your project plan</p><h2 className="mt-2 text-2xl font-bold">{activity.title}</h2><p className="mt-2 text-slate-600">{activity.intro}</p><div className="mt-5 space-y-5">{activity.steps.map((step, index) => <label key={step.id} className="block font-semibold"><span>{index + 1}. {step.prompt}</span><textarea rows={3} value={answers[step.id] ?? ""} onChange={(event) => setAnswers({ ...answers, [step.id]: event.target.value })} className="mt-2 w-full rounded-xl border-slate-300 font-normal" placeholder={step.placeholder} /></label>)}</div><div className="mt-5 flex flex-wrap gap-3"><button className="button-primary" onClick={finish} disabled={!ready || completed}>{completed ? "Plan complete" : "Complete capstone"}</button><button className="button-secondary" onClick={download} disabled={!ready}>Download plan</button></div></div>;
}
