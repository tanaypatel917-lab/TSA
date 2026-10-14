"use client";

import { useEffect, useState } from "react";
import { useMotionPreference } from "./MotionPreferences";
import { play, setSound, soundOn } from "./world/sound";

export const TEXT_KEY = "wordplay:text:v1";
const sizes = ["normal", "large", "larger"] as const;
type TextSize = (typeof sizes)[number];
const names: Record<TextSize, string> = { normal: "Normal", large: "Large", larger: "Larger" };

export function ComfortPill() {
  const { reduced, setPreference } = useMotionPreference();
  const [sound, setSoundState] = useState(true);
  const [text, setText] = useState<TextSize>("normal");
  useEffect(() => {
    setSoundState(soundOn());
    try {
      const saved = localStorage.getItem(TEXT_KEY);
      if (saved === "large" || saved === "larger") setText(saved);
    } catch {}
    const sync = (event: Event) => setSoundState((event as CustomEvent<boolean>).detail);
    window.addEventListener("wordplay:sound", sync);
    return () => window.removeEventListener("wordplay:sound", sync);
  }, []);
  useEffect(() => {
    if (text === "normal") delete document.documentElement.dataset.text;
    else document.documentElement.dataset.text = text;
  }, [text]);
  function toggleSound() {
    setSound(!sound);
    if (!sound) play("tick");
  }
  function cycleText() {
    const next = sizes[(sizes.indexOf(text) + 1) % sizes.length];
    setText(next);
    try { localStorage.setItem(TEXT_KEY, next); } catch {}
  }
  return <div className="comfort-pill" role="group" aria-label="Comfort settings">
    <button type="button" className="motion-toggle" aria-pressed={reduced} onClick={() => setPreference(reduced ? "full" : "reduced")}>Calm</button>
    <button type="button" className="comfort-sound" aria-pressed={sound} onClick={toggleSound}><span aria-hidden="true" className="comfort-icon" data-on={sound} /><span className="comfort-label">Sound</span></button>
    <button type="button" className="comfort-text" aria-label={`Text size: ${names[text]}`} data-size={text} onClick={cycleText}><span aria-hidden="true">A<small>A</small></span></button>
  </div>;
}
