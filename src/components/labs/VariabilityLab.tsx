"use client";

import { useMemo, useState } from "react";
import { predictorCorpus, predictorStarters } from "@/content/predictor";
import { END, pick, predict, tokenize, train } from "@/engine/predictor";
import { LabFrame } from "./LabFrame";

export function VariabilityLab() {
  const model = useMemo(() => train(predictorCorpus), []);
  const [starter, setStarter] = useState<string>(predictorStarters[1]);
  const [temperature, setTemperature] = useState(1.1);
  const [answers, setAnswers] = useState<string[]>([]);
  function ask() {
    setAnswers(Array.from({ length: 3 }, () => {
      let context = tokenize(starter);
      for (let step = 0; step < 14; step += 1) {
        const word = pick(predict(model, context).guesses, temperature);
        if (!word) break;
        context = [...context, word];
        if (word === END) break;
      }
      return context.join(" ").replace(/ \./g, ".").replace(/^./, (letter) => letter.toUpperCase());
    }));
  }
  const unique = new Set(answers).size;
  return <LabFrame id="lab-vary" title="Ask the same question three times." note="Most chat tools add some randomness, so the same prompt can give different answers. That is why you compare versions and verify the one you keep. This uses the same tiny model as the homepage demo.">
    <div className="lab-choices" role="group" aria-label="Start the sentence with">
      {predictorStarters.map((value) => <button key={value} type="button" aria-pressed={value === starter} onClick={() => { setStarter(value); setAnswers([]); }}>{value}…</button>)}
    </div>
    <label className="lab-field"><span>Creativity: <strong>{temperature <= 0.1 ? "none" : temperature < 0.9 ? "low" : temperature < 1.4 ? "medium" : "high"}</strong></span><input type="range" min={0} max={1.6} step={0.1} value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /></label>
    <button type="button" className="button-primary lab-go" onClick={ask}>Ask three times</button>
    {answers.length > 0 && <ol className="vary-list" aria-live="polite">{answers.map((text, index) => <li key={index}><span>Answer {index + 1}</span>{text}</li>)}</ol>}
    {answers.length > 0 && <p className="lab-score">{unique === 1 ? "All three answers match. With no creativity the model always takes its top guess." : `${unique} different answers from one prompt.`}</p>}
  </LabFrame>;
}
