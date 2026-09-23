"use client";

import Link from "next/link";
import type { Mission } from "@/content/missions";
import type { Module } from "@/content/types";
import { moduleVisuals } from "@/content/visuals";
import type { Station } from "@/content/world";
import { RUN } from "@/engine/mission";
import { WORLD_XP } from "@/engine/progress";
import { WorldDialog } from "./WorldDialog";

type Props = { station: Station; module: Module; mission: Mission; stamped: boolean; best?: number; bestStars?: number; relaxed: boolean; driving: boolean; onRelaxed: (value: boolean) => void; onStart: () => void; onClose: () => void };

export function Stars({ count, label }: { count: number; label?: boolean }) {
  return <span className="mission-stars" aria-label={label === false ? undefined : `${count} of 3 stars`} role={label === false ? undefined : "img"}>{[0, 1, 2].map((index) => <span key={index} aria-hidden="true" data-on={index < count}>★</span>)}</span>;
}

export function MissionBriefing({ station, module, mission, stamped, best, bestStars = 0, relaxed, driving, onRelaxed, onStart, onClose }: Props) {
  const visual = moduleVisuals[module.id];
  return <WorldDialog labelledBy="mission-title" module={module.id} onClose={onClose}>
    <header className="station-head">
      <p>Station {station.number} · {visual.chapter}</p>
      <span className="station-stamp" data-stamped={stamped} aria-hidden="true">{stamped ? "Stamped" : visual.mark}</span>
      <h2 id="mission-title" tabIndex={-1} data-autofocus>{mission.title}</h2>
      <p className="station-lede">{mission.brief}</p>
    </header>
    <div className="mission-gates" aria-label="The two gates">
      {mission.gates.map((gate) => <span key={gate.id} style={{ "--gate": gate.color } as React.CSSProperties}>{gate.label}</span>)}
    </div>
    <ol className="mission-rules">
      <li>{driving ? "Drive into a crate to pick it up and read it." : "Read each crate as it arrives."}</li>
      <li>{driving ? "Drive it through the gate where it belongs." : "Choose the gate where it belongs."} Right answers in a row build a combo up to ×{RUN.maxCombo}.</li>
      <li>{RUN.lives} mistakes end the run{relaxed ? "." : `, and so does the ${RUN.seconds}-second clock.`} One star or more stamps the station (+{WORLD_XP.stamp} XP); a first perfect run adds +{WORLD_XP.perfect} XP.</li>
    </ol>
    <label className="mission-relaxed"><input type="checkbox" checked={relaxed} onChange={(event) => onRelaxed(event.target.checked)} /> <span><strong>Relaxed mode</strong> No clock and no time bonus. Take as long as you need.</span></label>
    <footer className="station-actions">
      <div className="mission-best">{best ? <><Stars count={bestStars} /> <span>Best {best.toLocaleString()}</span></> : <span>No run yet</span>}</div>
      <div className="mission-start">
        <Link href={`/modules/${module.slug}`} className="text-link">Open the chapter <span aria-hidden="true">↗</span></Link>
        <button type="button" className="button-primary" onClick={onStart}>Start mission <span aria-hidden="true">→</span></button>
      </div>
    </footer>
  </WorldDialog>;
}
