"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function CaseStudies({ activity, moduleId }: { activity: Extract<Activity, { kind: "case-studies" }>; moduleId: string }) {
  const { dispatch } = useProgress(); const [open, setOpen] = useState<string | null>(null); const [notes, setNotes] = useState<Record<string, string>>({}); const [completed, setCompleted] = useState(false);
  const allDone = activity.cases.every((item) => (notes[item.id] ?? "").trim().length > 0);
  function finish() { if (allDone && !completed) { setCompleted(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); } }
  return <div className="card"><p className="eyebrow">Field notes</p><h2 className="mt-2 text-2xl font-bold">{activity.title}</h2><p className="mt-2 text-slate-600">{activity.intro}</p><Stagger className="mt-5 space-y-3">{activity.cases.map((item) => <StaggerItem key={item.id}><div className="rounded-xl border border-slate-200 p-4"><button className="flex w-full items-center justify-between text-left font-bold" onClick={() => setOpen(open === item.id ? null : item.id)}>{item.title}<span>{open === item.id ? "−" : "+"}</span></button>{open === item.id && <div className="mt-3"><p className="text-slate-700">{item.summary}</p><p className="mt-3 text-sm font-semibold">{item.reflection}</p><textarea rows={2} value={notes[item.id] ?? ""} onChange={(event) => setNotes({ ...notes, [item.id]: event.target.value })} className="mt-2 w-full rounded-lg border-slate-300" placeholder="Your reflection..." /></div>}</div></StaggerItem>)}</Stagger><button className="button-primary mt-5" onClick={finish} disabled={!allDone || completed}>{completed ? "Activity complete" : "Complete case studies"}</button></div>;
}
