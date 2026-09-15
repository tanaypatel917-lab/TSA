"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function Capstone({ activity, moduleId }: { activity: Extract<Activity, { kind: "capstone" }>; moduleId: string }) {
  const { dispatch } = useProgress(); const [answers, setAnswers] = useState<Record<string, string>>({}); const [completed, setCompleted] = useState(false);
  const ready = activity.steps.every((step) => (answers[step.id] ?? "").trim());
  const filled = activity.steps.filter((step) => (answers[step.id] ?? "").trim()).length;
  function finish() { if (ready && !completed) { setCompleted(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); } }
  function download() { const text = activity.steps.map((step) => `${step.prompt}\n${answers[step.id]}`).join("\n\n"); const url = URL.createObjectURL(new Blob([text], { type: "text/plain" })); const link = document.createElement("a"); link.href = url; link.download = "ai-compass-project-plan.txt"; link.click(); URL.revokeObjectURL(url); }
  return (
    <div className="card">
      <div className="flex items-center justify-between"><p className="eyebrow">Your project plan</p><span className="index">{filled}/{activity.steps.length} steps</span></div>
      <h2 className="display-md mt-4">{activity.title}</h2><p className="mt-4 text-base leading-relaxed text-mute">{activity.intro}</p>
      <ol className="mt-8 divide-y divide-ink border-y border-ink">
        {activity.steps.map((step, index) => (
          <li key={step.id} className="py-6">
            <label className="block"><span className="flex gap-4 font-display text-base font-bold"><span className="index pt-1">{String(index + 1).padStart(2, "0")}</span>{step.prompt}</span>
              <textarea rows={3} value={answers[step.id] ?? ""} onChange={(event) => setAnswers({ ...answers, [step.id]: event.target.value })} className="field mt-4" placeholder={step.placeholder} />
            </label>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap gap-3"><button className="button-primary" onClick={finish} disabled={!ready || completed}>{completed ? "Plan complete" : "Complete capstone"}</button><button className="button-secondary" onClick={download} disabled={!ready}>Download plan</button></div>
    </div>
  );
}
