"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Mission } from "@/content/missions";
import { MODES, type Run } from "@/engine/mission";
import type { ScoreEntry } from "@/engine/scores";
import { WORLD_XP } from "@/engine/progress";
import { useMotionPreference } from "../MotionPreferences";
import { Board } from "./MissionBriefing";
import { WorldDialog } from "./WorldDialog";

type Props = { mission: Mission; run: Run; stars: number; best: boolean; stamped: boolean; perfect: boolean; daily: string | null; board: ScoreEntry[]; rank: number | null; onAgain: () => void; onClose: () => void };

const endings = { cleared: "Every crate delivered.", time: "Time’s up.", mistakes: "Out of lives. Run over." };
const verdicts = ["Keep practicing.", "Station stamped.", "Sharp sorting.", "Perfect run."];

export function MissionResults({ mission, run, stars, best, stamped, perfect, daily, board, rank, onAgain, onClose }: Props) {
  const { reduced } = useMotionPreference();
  const [score, setScore] = useState(0);
  const correct = run.results.filter((result) => result.ok).length;
  const gate = (id: string) => mission.gates.find((item) => item.id === id)!;

  useEffect(() => {
    if (reduced) { setScore(run.score); return; }
    const started = performance.now();
    let frame = 0;
    const count = (now: number) => {
      const progress = Math.min(1, (now - started) / 700);
      setScore(Math.round(run.score * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(count);
    };
    frame = requestAnimationFrame(count);
    return () => cancelAnimationFrame(frame);
  }, [reduced, run.score]);

  return <WorldDialog labelledBy="results-title" module={mission.moduleId} onClose={onClose} wide>
    <header className="results-head">
      <p className="results-kicker">{daily ? `Daily challenge · ${daily} · ` : `${MODES[run.mode].label} · `}{run.over ? endings[run.over] : ""}</p>
      <span className="results-stars" aria-label={`${stars} of 3 stars`} role="img">{[0, 1, 2].map((index) => <span key={index} data-on={index < stars} style={{ "--star-delay": `${index * 180}ms` } as CSSProperties} aria-hidden="true">★</span>)}</span>
      <h2 id="results-title" tabIndex={-1} data-autofocus>{stars ? verdicts[stars] : verdicts[0]}</h2>
      <dl className="results-figures">
        <div><dt>Score</dt><dd>{score.toLocaleString()}{best && <span className="results-best">New best</span>}</dd></div>
        <div><dt>Sorted right</dt><dd>{correct}<span>/{run.results.length}</span></dd></div>
        <div><dt>Mistakes</dt><dd>{run.mistakes}</dd></div>
      </dl>
      {(stamped || perfect) && <p className="station-earned">{[stamped && `Station stamped · +${WORLD_XP.stamp} XP`, perfect && `First perfect run · +${WORLD_XP.perfect} XP`].filter(Boolean).join("  ·  ")}</p>}
      {rank && <p className="results-rank">{rank === 1 ? "New #1 on your board!" : `#${rank} on your board`}</p>}
      {!stars && <p className="results-hint">Sort at least {Math.ceil(run.order.length * 0.6)} crates right to earn a star and stamp this station.</p>}
    </header>
    <section className="mission-board" aria-label="Your top runs"><h3>{daily ? "Your top runs today" : `Your top ${MODES[run.mode].label.toLowerCase()} runs`}</h3><Board entries={board} highlight={rank} /></section>
    <ol className="results-list" aria-label="What you sorted">
      {run.results.map((result, index) => {
        const item = mission.items[result.item];
        return <li key={index} data-ok={result.ok}>
          <span className="results-mark" aria-hidden="true">{result.ok ? "✓" : "✗"}</span>
          <div>
            <p className="results-item">{item.text}</p>
            <p className="results-why"><strong>{result.ok ? `Right: ${gate(item.gate).label}.` : `You chose ${gate(result.gate).label}; it belongs in ${gate(item.gate).label}.`}</strong> {item.why}</p>
          </div>
        </li>;
      })}
    </ol>
    <footer className="station-actions">
      <button type="button" className="button-secondary" onClick={onClose}>Back to the world</button>
      <button type="button" className="button-primary" onClick={onAgain}>Play again <span aria-hidden="true">↻</span></button>
    </footer>
  </WorldDialog>;
}
