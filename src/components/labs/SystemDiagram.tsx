"use client";

import { useState } from "react";
import { LabFrame } from "./LabFrame";

const inputs = [
  { id: "message", label: "A message", input: "“WIN a free phone!!!”", data: "Thousands of messages labeled spam or not spam", output: "Spam", confidence: 94 },
  { id: "photo", label: "A photo", input: "A blurry photo of a pet", data: "Millions of photos labeled with what is in them", output: "Cat", confidence: 71 },
  { id: "sentence", label: "A sentence", input: "“Always check the…”", data: "Billions of sentences from books and websites", output: "facts", confidence: 38 }
];

export function SystemDiagram() {
  const [pick, setPick] = useState(inputs[0]);
  return <LabFrame id="lab-system" kicker="See it" title="Every AI system: data in, patterns out." note="The model never looks anything up or understands the input. It returns the answer that best matches patterns in its training data, with a confidence score, and a confident answer can still be wrong.">
    <div className="lab-choices" role="group" aria-label="Choose an input">
      {inputs.map((item) => <button key={item.id} type="button" aria-pressed={item.id === pick.id} onClick={() => setPick(item)}>{item.label}</button>)}
    </div>
    <div className="system-flow" aria-live="polite">
      <div className="system-node is-data"><span className="node-label">1 · Training data</span><p>{pick.data}</p></div>
      <span className="system-arrow" aria-hidden="true"><i /></span>
      <div className="system-node is-model"><span className="node-label">2 · Model</span><p>Learned patterns</p><span className="system-mark" aria-hidden="true">?</span></div>
      <span className="system-arrow" aria-hidden="true"><i /></span>
      <div className="system-node is-output"><span className="node-label">3 · Output</span><p><strong>{pick.output}</strong></p><span className="confidence"><i style={{ width: `${pick.confidence}%` }} /></span><small>{pick.confidence}% confident</small></div>
    </div>
    <p className="system-input"><span>New input</span> {pick.input} <span aria-hidden="true">→ goes into the model</span></p>
  </LabFrame>;
}
