"use client";

import { useState } from "react";
import { accuracy, centroids, exam, trainingSet } from "@/engine/labs";
import { LabFrame } from "./LabFrame";

const SIZE = 300;
const at = (value: number) => value * SIZE;

export function BiasLab() {
  const [share, setShare] = useState(0);
  const training = trainingSet(share);
  const model = centroids(training);
  const scoreA = accuracy(model, "A");
  const scoreB = accuracy(model, "B");
  const mid = { x: (model.ripe.x + model.unripe.x) / 2, y: (model.ripe.y + model.unripe.y) / 2 };
  const dx = model.ripe.x - model.unripe.x;
  const dy = model.ripe.y - model.unripe.y;
  const reach = 2;
  const line = { x1: mid.x - dy * reach, y1: mid.y + dx * reach, x2: mid.x + dy * reach, y2: mid.y - dx * reach };
  return <LabFrame id="lab-bias" title="Train a fruit sorter on one farm’s photos." note="This is a real, tiny model (nearest average) trained in your browser on made-up fruit photos. Farm B photos are taken in shade, so ripe fruit looks darker there. Accuracy is measured on 120 fresh photos, half from each farm.">
    <label className="lab-field"><span>Farm B photos in the training set: <strong>{Math.round(share * 100)}%</strong></span><input type="range" min={0} max={0.5} step={0.05} value={share} onChange={(event) => setShare(Number(event.target.value))} /></label>
    <div className="bias-grid">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="bias-plot" role="img" aria-label={`Scatter plot of test photos with the model's dividing line. Farm A accuracy ${Math.round(scoreA * 100)}%, Farm B accuracy ${Math.round(scoreB * 100)}%.`}>
        <defs><clipPath id="bias-clip"><rect width={SIZE} height={SIZE} /></clipPath></defs>
        <rect width={SIZE} height={SIZE} className="plot-bg" />
        <g clipPath="url(#bias-clip)"><line x1={at(line.x1)} y1={at(1 - line.y1)} x2={at(line.x2)} y2={at(1 - line.y2)} className="plot-line" /></g>
        {exam.map((item, index) => item.farm === "A"
          ? <circle key={index} cx={at(item.x)} cy={at(1 - item.y)} r={5} className="plot-dot" data-ripe={item.ripe} />
          : <rect key={index} x={at(item.x) - 4.5} y={at(1 - item.y) - 4.5} width={9} height={9} className="plot-dot" data-ripe={item.ripe} />)}
        <text x={8} y={SIZE - 8} className="plot-axis">greener</text>
        <text x={SIZE - 8} y={SIZE - 8} textAnchor="end" className="plot-axis">redder →</text>
      </svg>
      <div className="bias-results" aria-live="polite">
        {([["Farm A", scoreA], ["Farm B", scoreB]] as const).map(([label, score]) => <div key={label} className="bias-bar"><span>{label} <strong>{Math.round(score * 100)}%</strong></span><span className="bias-track"><i style={{ width: `${score * 100}%` }} data-low={score < 0.75} /></span></div>)}
        <p className="bias-gap">{scoreA - scoreB > 0.1 ? `A ${Math.round((scoreA - scoreB) * 100)}-point gap. The model mostly learned what ripe looks like on Farm A.` : "The gap is small. Representative data helped the model work for both farms."}</p>
        <p className="bias-key"><span className="key-dot" /> Farm A <span className="key-square" /> Farm B · <span className="key-ripe">filled = ripe</span></p>
      </div>
    </div>
  </LabFrame>;
}
