"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function CaseStudies({ activity, moduleId }: { activity: Extract<Activity, { kind: "case-studies" }>; moduleId: string }) {
  const { dispatch } = useProgress(); const [open, setOpen] = useState<string | null>(null); const [notes, setNotes] = useState<Record<string, string>>({}); const [completed, setCompleted] = useState(false);
  const allDone = activity.cases.every((item) => (notes[item.id] ?? "").trim().length > 0);
  function finish() { if (allDone && !completed) { setCompleted(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); } }
  return (
    <div className="card">
      <p className="eyebrow">Field notes</p>
      <h2 className="display-md mt-4">{activity.title}</h2><p className="mt-4 text-base leading-relaxed text-mute">{activity.intro}</p>
      <div className="mt-8 divide-y divide-ink border-y border-ink">
        {activity.cases.map((item, index) => {
          const isOpen = open === item.id; const noted = (notes[item.id] ?? "").trim().length > 0;
          return (
            <div key={item.id}>
              <button className="flex w-full items-baseline gap-4 py-5 text-left font-display text-lg font-bold transition-colors hover:text-signal focus-visible:outline-none focus-visible:text-signal" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : item.id)}>
                <span className="index">{String(index + 1).padStart(2, "0")}</span><span className="flex-1">{item.title}</span>{noted && <span className="index">noted</span>}<span aria-hidden="true" className="font-mono">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="pb-6 sm:pl-10">
                  <p className="text-base leading-relaxed">{item.summary}</p>
                  <label className="mt-5 block"><span className="mono-label text-mute">reflect</span><span className="mt-1 block font-display text-base font-bold">{item.reflection}</span>
                    <textarea rows={2} value={notes[item.id] ?? ""} onChange={(event) => setNotes({ ...notes, [item.id]: event.target.value })} className="field" placeholder="Your reflection..." />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button className="button-primary mt-8" onClick={finish} disabled={!allDone || completed}>{completed ? "Activity complete" : "Complete case studies"}</button>
    </div>
  );
}
