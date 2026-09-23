"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function Capstone({ activity, moduleId }: { activity: Extract<Activity, { kind: "capstone" }>; moduleId: string }) {
  const { dispatch } = useProgress(); const [answers, setAnswers] = useState<Record<string, string>>({}); const [completed, setCompleted] = useState(false);
  const answered = (id: string) => (answers[id] ?? "").trim().length > 0;
  const filled = activity.steps.filter((step) => answered(step.id)).length;
  const ready = filled === activity.steps.length;
  function finish() { if (ready && !completed) { setCompleted(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); } }
  function download() { const text = activity.steps.map((step) => `${step.prompt}\n${answers[step.id]}`).join("\n\n"); const url = URL.createObjectURL(new Blob([text], { type: "text/plain" })); const link = document.createElement("a"); link.href = url; link.download = "wordplay-project-plan.txt"; link.click(); URL.revokeObjectURL(url); }
  return <div className="project-brief"><div className="activity-progress"><p>{filled} of {activity.steps.length} answered</p><div className="activity-steps" aria-hidden="true">{activity.steps.map((step) => <i key={step.id} data-reached={answered(step.id)} />)}</div></div><ol className="brief-steps">{activity.steps.map((step, index) => <li key={step.id}><label htmlFor={`brief-${step.id}`}><span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>{step.prompt}</span></label><textarea id={`brief-${step.id}`} rows={3} value={answers[step.id] ?? ""} onChange={(event) => setAnswers({ ...answers, [step.id]: event.target.value })} placeholder={step.placeholder} /></li>)}</ol><div className="brief-actions"><button className="button-primary" onClick={finish} disabled={!ready || completed}>{completed ? "Plan complete" : "Complete capstone"}</button><button className="button-secondary" onClick={download} disabled={!ready}>Download plan</button><p className="small-note">Answers are not saved after you leave this page. Download the plan to keep it.</p></div></div>;
}
