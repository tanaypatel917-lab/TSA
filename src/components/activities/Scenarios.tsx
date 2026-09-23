"use client";
import { useEffect, useRef, useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

export function Scenarios({ activity, moduleId }: { activity: Extract<Activity, { kind: "scenarios" }>; moduleId: string }) {
  const { dispatch } = useProgress();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [defensible, setDefensible] = useState(0);
  const [done, setDone] = useState(false);
  const focusTarget = useRef<HTMLHeadingElement>(null);
  const moveFocus = useRef(false);
  const scenario = activity.scenarios[index];
  const total = activity.scenarios.length;
  const option = chosen === null ? null : scenario.options[chosen];
  useEffect(() => { if (moveFocus.current) { focusTarget.current?.focus(); moveFocus.current = false; } }, [index, done]);
  function choose(position: number) {
    if (chosen !== null) return;
    setChosen(position);
    if (scenario.options[position].ok) setDefensible((value) => value + 1);
  }
  function next() {
    moveFocus.current = true;
    if (index === total - 1) { setDone(true); dispatch({ type: "activity-completed", moduleId, day: todayKey() }); }
    else { setIndex((value) => value + 1); setChosen(null); }
  }
  if (done) return <div className="activity-result"><p className="section-index">Scenarios complete</p><h2 ref={focusTarget} tabIndex={-1}>{defensible} of {total} calls you could defend.</h2><p>Responsible choices tend to share three moves: be honest about how a tool was used, check who could be affected, and protect other people’s information.</p></div>;
  return <div className="docket"><div className="activity-progress"><p>Scenario {index + 1} of {total}</p><div className="activity-steps" aria-hidden="true">{activity.scenarios.map((item, position) => <i key={item.id} data-reached={position <= index} />)}</div></div><h2 ref={focusTarget} tabIndex={-1} className="docket-situation">{scenario.situation}</h2><div className="answer-list">{scenario.options.map((item, position) => {
    const state = chosen === null ? "unanswered" : item.ok ? "correct" : position === chosen ? "incorrect" : "unselected";
    const status = state === "correct" ? "Defensible" : state === "incorrect" ? "Reconsider" : "";
    return <button key={item.text} className="answer-choice" data-state={state} aria-pressed={position === chosen} disabled={chosen !== null} onClick={() => choose(position)}><span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + position)}</span><span>{item.text}</span>{status && <span className="answer-status">{status}</span>}</button>;
  })}</div>{option && <div className="answer-feedback"><div role="status" aria-live="polite"><strong>{option.ok ? "A choice you can defend." : "Worth reconsidering."}</strong><p>{option.feedback}</p></div><button className="button-primary" onClick={next}>{index === total - 1 ? "Finish" : "Next scenario"}</button></div>}</div>;
}
