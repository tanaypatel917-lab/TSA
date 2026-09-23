"use client";

import type { Mission } from "@/content/missions";
import type { Run } from "@/engine/mission";
import { WORLD_XP } from "@/engine/progress";
import { Stars } from "./MissionBriefing";
import { WorldDialog } from "./WorldDialog";

type Props = { mission: Mission; run: Run; stars: number; best: boolean; stamped: boolean; perfect: boolean; onAgain: () => void; onClose: () => void };

const endings = { cleared: "Every crate delivered.", time: "Time’s up.", mistakes: "Three mistakes. Run over." };
const verdicts = ["Keep practicing.", "Station stamped.", "Sharp sorting.", "Perfect run."];

export function MissionResults({ mission, run, stars, best, stamped, perfect, onAgain, onClose }: Props) {
  const correct = run.results.filter((result) => result.ok).length;
  const gate = (id: string) => mission.gates.find((item) => item.id === id)!;
  return <WorldDialog labelledBy="results-title" module={mission.moduleId} onClose={onClose} wide>
    <header className="results-head">
      <p className="results-kicker">{run.over ? endings[run.over] : ""}</p>
      <Stars count={stars} />
      <h2 id="results-title" tabIndex={-1} data-autofocus>{stars ? verdicts[stars] : verdicts[0]}</h2>
      <dl className="results-figures">
        <div><dt>Score</dt><dd>{run.score.toLocaleString()}{best && <span className="results-best">New best</span>}</dd></div>
        <div><dt>Sorted right</dt><dd>{correct}<span>/{run.results.length}</span></dd></div>
        <div><dt>Mistakes</dt><dd>{run.mistakes}</dd></div>
      </dl>
      {(stamped || perfect) && <p className="station-earned">{[stamped && `Station stamped · +${WORLD_XP.stamp} XP`, perfect && `First perfect run · +${WORLD_XP.perfect} XP`].filter(Boolean).join("  ·  ")}</p>}
      {!stars && <p className="results-hint">Sort at least {Math.ceil(run.order.length * 0.6)} crates right to earn a star and stamp this station.</p>}
    </header>
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
