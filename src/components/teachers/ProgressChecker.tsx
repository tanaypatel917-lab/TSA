"use client";

import { useState, type ChangeEvent } from "react";
import { modules } from "@/content";
import { moduleVisuals } from "@/content/visuals";
import { BADGES } from "@/engine/badges";
import { chapterProgress } from "@/engine/chapters";
import { levelFor } from "@/engine/levels";
import type { ProgressState } from "@/engine/progress";
import { importProgress } from "@/engine/storage";

type Row = { file: string; state: ProgressState | null };

const read = (file: File) => new Promise<Row>((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ file: file.name, state: typeof reader.result === "string" ? importProgress(reader.result) : null });
  reader.onerror = () => resolve({ file: file.name, state: null });
  reader.readAsText(file);
});

export function ProgressChecker() {
  const [rows, setRows] = useState<Row[]>([]);
  const [key, setKey] = useState(0);

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const next = await Promise.all(files.map(read));
    setRows((current) => [...current, ...next]);
    setKey((value) => value + 1);
  }

  const valid = rows.filter((row) => row.state);
  return <div className="checker">
    <div className="checker-pick">
      <label className="checker-drop"><span className="button-primary">Choose progress files</span><input key={key} type="file" accept="application/json,.json" multiple onChange={choose} /><span className="checker-hint">Students export this file from My learning. You can pick several at once.</span></label>
      {rows.length > 0 && <button type="button" className="plan-print" onClick={() => setRows([])}>Clear</button>}
    </div>
    <p className="checker-privacy">Files are read in this browser and never uploaded.</p>
    {rows.filter((row) => !row.state).map((row) => <p key={row.file} className="checker-error" role="alert">{row.file}: this isn’t a Wordplay progress file.</p>)}
    {valid.length > 0 && <div className="checker-table" role="region" aria-label="Student progress" tabIndex={0}>
      <table>
        <thead><tr><th scope="col">File</th><th scope="col">Chapters done</th>{modules.map((module) => <th key={module.id} scope="col">{moduleVisuals[module.id].chapter} quiz</th>)}<th scope="col">XP and level</th><th scope="col">Badges</th><th scope="col">Streak</th></tr></thead>
        <tbody>{valid.map(({ file, state }) => {
          const progress = state!;
          const done = modules.filter((module) => chapterProgress(progress, module).complete).length;
          return <tr key={file}>
            <th scope="row">{file.replace(/\.json$/i, "")}</th>
            <td><strong>{done}</strong> of {modules.length}</td>
            {modules.map((module) => { const best = progress.quizBest[module.id]; return <td key={module.id} data-pass={best !== undefined && best >= 70}>{best === undefined ? "—" : `${best}%`}</td>; })}
            <td>{progress.xp} XP · {levelFor(progress.xp).name}</td>
            <td>{progress.badges.length} of {BADGES.length}</td>
            <td>{progress.streak.count} {progress.streak.count === 1 ? "day" : "days"}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>}
  </div>;
}
