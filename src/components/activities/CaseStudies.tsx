"use client";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function CaseStudies({ activity, moduleId }: { activity: Extract<Activity, { kind: "case-studies" }>; moduleId: string }) {
  const { dispatch } = useProgress();
  const [open, setOpen] = useState<string | null>(activity.cases[0]?.id ?? null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const noted = (id: string) => (notes[id] ?? "").trim().length > 0;
  const written = activity.cases.filter((item) => noted(item.id)).length;
  const remaining = activity.cases.length - written;
  function finish() { if (!remaining && !completed) { setCompleted(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); } }
  return <div className="field-notes"><div className="activity-progress"><p>{written} of {activity.cases.length} notes written</p><div className="activity-steps" aria-hidden="true">{activity.cases.map((item) => <i key={item.id} data-reached={noted(item.id)} />)}</div></div><ol className="field-list">{activity.cases.map((item, position) => {
    const isOpen = open === item.id;
    return <li key={item.id} className="field-case" data-open={isOpen} data-written={noted(item.id)}><h2 className="field-heading"><button className="field-toggle" aria-expanded={isOpen} aria-controls={`case-${item.id}`} onClick={() => setOpen(isOpen ? null : item.id)}><span className="step-number" aria-hidden="true">{String(position + 1).padStart(2, "0")}</span><span className="field-title">{item.title}</span><span className="field-state">{noted(item.id) ? "Noted" : "To do"}</span><span className="field-icon" aria-hidden="true">{isOpen ? "−" : "+"}</span></button></h2><div className="field-body" id={`case-${item.id}`} hidden={!isOpen}><p>{item.summary}</p><label htmlFor={`note-${item.id}`}>{item.reflection}</label><textarea id={`note-${item.id}`} rows={3} value={notes[item.id] ?? ""} onChange={(event) => setNotes({ ...notes, [item.id]: event.target.value })} placeholder="A benefit, a risk, or a question you would ask…" /></div></li>;
  })}</ol><div className="brief-actions"><button className="button-primary" onClick={finish} disabled={remaining > 0 || completed}>{completed ? "Activity complete" : "Complete case studies"}</button><p className="small-note" role="status">{completed ? "Activity complete. Notes are not saved after you leave this page." : remaining ? `Write a note for ${remaining} more ${remaining === 1 ? "case" : "cases"}. Notes are not saved after you leave this page.` : "Every case has a note. You can finish now."}</p></div></div>;
}
