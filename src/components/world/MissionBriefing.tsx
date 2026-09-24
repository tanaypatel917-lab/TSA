"use client";

import Link from "next/link";
import type { Mission } from "@/content/missions";
import type { Module } from "@/content/types";
import { moduleVisuals } from "@/content/visuals";
import type { Station } from "@/content/world";
import { MODES, RUN, type Difficulty } from "@/engine/mission";
import { WORLD_XP } from "@/engine/progress";
import type { ScoreEntry } from "@/engine/scores";
import { WorldDialog } from "./WorldDialog";

type Props = { station: Station; module: Module; mission: Mission; stamped: boolean; bestStars?: number; mode: Difficulty; daily: string | null; board: ScoreEntry[]; driving: boolean; onMode: (value: Difficulty) => void; onStart: () => void; onClose: () => void };

export function Stars({ count, label }: { count: number; label?: boolean }) {
  return <span className="mission-stars" aria-label={label === false ? undefined : `${count} of 3 stars`} role={label === false ? undefined : "img"}>{[0, 1, 2].map((index) => <span key={index} aria-hidden="true" data-on={index < count}>★</span>)}</span>;
}

export function Board({ entries, highlight }: { entries: ScoreEntry[]; highlight?: number | null }) {
  if (!entries.length) return <p className="board-empty">No runs yet. Your top five will appear here.</p>;
  return <ol className="board">{entries.map((entry, index) => <li key={`${entry.at}-${index}`} data-new={highlight === index + 1}><span className="board-rank">{index + 1}</span><span className="board-score">{entry.score.toLocaleString()}</span><Stars count={entry.stars} label={false} /><span className="board-day">{entry.day}</span></li>)}</ol>;
}

export function MissionBriefing({ station, module, mission, stamped, bestStars = 0, mode, daily, board, driving, onMode, onStart, onClose }: Props) {
  const visual = moduleVisuals[module.id];
  const config = MODES[daily ? "standard" : mode];
  return <WorldDialog labelledBy="mission-title" module={module.id} onClose={onClose}>
    <header className="station-head">
      <p>{daily ? `Daily challenge · ${daily}` : `Station ${station.number} · ${visual.chapter}`}</p>
      <span className="station-stamp" data-stamped={stamped} aria-hidden="true">{daily ? "Daily" : stamped ? "Stamped" : visual.mark}</span>
      <h2 id="mission-title" tabIndex={-1} data-autofocus>{mission.title}</h2>
      <p className="station-lede">{daily ? `Today’s challenge is the ${visual.chapter} mission, with the same crates for everyone today. ` : ""}{mission.brief}</p>
    </header>
    <div className="mission-gates" aria-label="The two gates">
      {mission.gates.map((gate) => <span key={gate.id} style={{ "--gate": gate.color } as React.CSSProperties}>{gate.label}</span>)}
    </div>
    <ol className="mission-rules">
      <li>{driving ? "Drive into a crate to pick it up and read it." : "Read each crate as it arrives."}</li>
      <li>{driving ? "Drive it through the gate where it belongs." : "Choose the gate where it belongs."} Right answers in a row build a combo up to ×{RUN.maxCombo}.</li>
      <li>{config.lives} mistakes end the run{config === MODES.relaxed ? "." : `, and so does the ${config.seconds}-second clock.`} One star or more stamps the station (+{WORLD_XP.stamp} XP); a first perfect run adds +{WORLD_XP.perfect} XP.</li>
    </ol>
    {!daily && <fieldset className="mission-modes">
      <legend>Difficulty</legend>
      {(Object.keys(MODES) as Difficulty[]).map((key) => <label key={key} data-on={mode === key}><input type="radio" name="mission-mode" value={key} checked={mode === key} onChange={() => onMode(key)} /><span><strong>{MODES[key].label}</strong>{MODES[key].blurb}</span></label>)}
    </fieldset>}
    <section className="mission-board" aria-label="Your top runs">
      <h3>{daily ? "Your top runs today" : `Your top ${config.label.toLowerCase()} runs`}</h3>
      <Board entries={board} />
    </section>
    <footer className="station-actions">
      <div className="mission-best">{bestStars ? <><Stars count={bestStars} /> <span>Best stars on this mission</span></> : <span>No stars yet</span>}</div>
      <div className="mission-start">
        <Link href={`/modules/${module.slug}`} className="text-link">Open the chapter <span aria-hidden="true">↗</span></Link>
        <button type="button" className="button-primary" onClick={onStart}>{daily ? "Start the daily" : "Start mission"} <span aria-hidden="true">→</span></button>
      </div>
    </footer>
  </WorldDialog>;
}
