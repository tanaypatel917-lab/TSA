"use client";

import { useEffect, useRef, useState } from "react";
import type { Mission } from "@/content/missions";
import { crateSpots } from "@/content/world";
import { deliver, pickUp, tick, type Run } from "@/engine/mission";
import { MissionHud } from "./MissionHud";
import { WorldDialog } from "./WorldDialog";

type Props = { mission: Mission; start: Run; onFinish: (run: Run) => void; onQuit: () => void };
type Feedback = { ok: boolean; text: string; key: number };

export function MapMission({ mission, start, onFinish, onQuit }: Props) {
  const [run, setRun] = useState(() => pickUp(start, 0, crateSpots));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const finished = useRef(false);
  const item = run.carrying === null ? null : mission.items[run.carrying];

  useEffect(() => {
    if (run.relaxed || run.over) return;
    const timer = window.setInterval(() => setRun((current) => tick(current, 0.25)), 250);
    return () => window.clearInterval(timer);
  }, [run.relaxed, run.over]);

  useEffect(() => {
    if (!run.over || finished.current) return;
    finished.current = true;
    const timer = window.setTimeout(() => onFinish(run), 700);
    return () => window.clearTimeout(timer);
  }, [run, onFinish]);

  function choose(gate: string) {
    const result = deliver(run, gate, mission);
    if (!result) return;
    const right = mission.gates.find((each) => each.id === mission.items[result.item].gate)!;
    const previous = mission.items[result.item];
    setFeedback({ ok: result.ok, text: `${result.ok ? `Right, +${result.points}` : "Not quite"}: “${previous.text}” belongs in ${right.label}. ${previous.why}`, key: Date.now() });
    setRun(result.run.over ? result.run : pickUp(result.run, 0, crateSpots));
  }

  return <WorldDialog labelledBy="map-mission-title" module={mission.moduleId} onClose={onQuit} wide>
    <h2 id="map-mission-title" className="sr-only">{mission.title}</h2>
    <MissionHud mission={mission} run={run} onQuit={onQuit} inline />
    <div className="map-mission-card" data-autofocus tabIndex={-1} aria-live="polite">
      {item ? <>{item.context && <p className="carry-context">{item.context}</p>}<p className="carry-text">{item.text}</p></> : <p className="carry-text">{run.over === "cleared" ? "All sorted." : run.over === "time" ? "Time’s up." : "Run over."}</p>}
    </div>
    <div className="map-mission-gates">
      {mission.gates.map((gate) => <button key={gate.id} type="button" disabled={!item} style={{ "--gate": gate.color } as React.CSSProperties} onClick={() => choose(gate.id)}>{gate.label}</button>)}
    </div>
    <p className="map-mission-feedback" role="status" data-ok={feedback?.ok} key={feedback?.key}>{feedback?.text ?? "Choose the gate where this crate belongs."}</p>
  </WorldDialog>;
}
