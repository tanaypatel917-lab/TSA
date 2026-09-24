"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { predictorCorpus, predictorStarters } from "@/content/predictor";
import { END, pick, predict, tokenize, train } from "@/engine/predictor";
import { useMotionPreference } from "./MotionPreferences";

const LIMIT = 14;
const moods = [[0.1, "Always the top guess"], [0.6, "Mostly likely words"], [1.1, "Adventurous"], [1.6, "Wild"]] as const;

export function NextWordDemo() {
  const model = useMemo(() => train(predictorCorpus), []);
  const { reduced } = useMotionPreference();
  const [starter, setStarter] = useState<string>(predictorStarters[0]);
  const [added, setAdded] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(0.6);
  const [writing, setWriting] = useState(false);
  const context = [...tokenize(starter), ...added];
  const { guesses, source } = predict(model, context);
  const done = source === "done" || added.length >= LIMIT;
  const live = useRef({ context, temperature });
  live.current = { context, temperature };
  const mood = moods.find(([limit]) => temperature <= limit)?.[1] ?? moods[moods.length - 1][1];

  useEffect(() => {
    if (!writing) return;
    const next = () => {
      const current = live.current;
      const word = pick(predict(model, current.context).guesses, current.temperature);
      if (!word || current.context.length - tokenize(starter).length >= LIMIT) { setWriting(false); return false; }
      setAdded((words) => [...words, word]);
      if (word === END) { setWriting(false); return false; }
      return true;
    };
    if (reduced) {
      const words: string[] = [];
      let current = live.current.context;
      for (let step = 0; step < LIMIT; step += 1) {
        const word = pick(predict(model, current).guesses, live.current.temperature);
        if (!word) break;
        words.push(word);
        current = [...current, word];
        if (word === END) break;
      }
      setAdded((existing) => [...existing, ...words]);
      setWriting(false);
      return;
    }
    const timer = window.setInterval(() => { if (!next()) window.clearInterval(timer); }, 460);
    return () => window.clearInterval(timer);
  }, [writing, model, reduced, starter]);

  function choose(value: string) {
    setWriting(false);
    setStarter(value);
    setAdded([]);
  }

  return <section className="demo" aria-labelledby="demo-title">
    <div className="demo-head">
      <p className="demo-kicker"><span aria-hidden="true" />Live demo</p>
      <h2 id="demo-title">Guess the next word, like a language model.</h2>
    </div>
    <div className="demo-starters" role="group" aria-label="Start the sentence with">
      {predictorStarters.map((value) => <button key={value} type="button" aria-pressed={value === starter} onClick={() => choose(value)}>{value}…</button>)}
    </div>
    <p className="demo-sentence" aria-live="polite" aria-label={`Sentence so far: ${[starter, ...added].join(" ").replace(/ \./g, ".")}`}>
      {tokenize(starter).map((token, index) => <span key={`s-${index}`} className="demo-token is-prompt">{token}</span>)}
      {added.map((token, index) => <span key={`a-${index}`} className="demo-token is-added" data-new={index === added.length - 1}>{token}</span>)}
      {!done && <span className="demo-caret" aria-hidden="true" />}
    </p>
    <div className="demo-guesses">
      <p className="demo-label">{done ? "Sentence finished." : "Most likely next words"}</p>
      {!done && <ol>
        {guesses.map((guess) => <li key={guess.word}><button type="button" disabled={writing} onClick={() => setAdded((words) => [...words, guess.word])} style={{ "--p": guess.p } as CSSProperties} aria-label={`Add ${guess.word === END ? "a period" : `“${guess.word}”`}, ${Math.round(guess.p * 100)}% likely`}>
          <span className="guess-word">{guess.word === END ? "(end)" : guess.word}</span>
          <span className="guess-bar" aria-hidden="true"><i /></span>
          <span className="guess-p">{Math.round(guess.p * 100)}%</span>
        </button></li>)}
      </ol>}
      {done && <p className="demo-done">The model only counted which word came next in {predictorCorpus.length} sentences. It never checked whether the sentence is true.</p>}
    </div>
    <div className="demo-controls">
      <label className="demo-temperature"><span>Creativity <b>{mood}</b></span><input type="range" min={0} max={1.6} step={0.1} value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /></label>
      <div className="demo-buttons">
        <button type="button" className="button-primary" disabled={writing || done} onClick={() => setWriting(true)}>{writing ? "Writing…" : "Let it write"}</button>
        <button type="button" className="demo-reset" onClick={() => choose(starter)} disabled={!added.length}>Reset</button>
      </div>
    </div>
    <p className="demo-note">A tiny model we trained on {predictorCorpus.length} sentences. Real language models learn from trillions of words and can still be confidently wrong. <Link href="/modules/ai-foundations/lessons/language-models" className="text-link">How language models work <span aria-hidden="true">↗</span></Link></p>
  </section>;
}
