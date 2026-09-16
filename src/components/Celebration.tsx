"use client";

import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@/state/ProgressProvider";

const CONFETTI_COLORS = ["#ff4f1f", "#c8f560", "#111111", "#d9d4c7"];

function chime() {
  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const start = context.currentTime;
    [660, 880].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      const noteStart = start + index * 0.12;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.2);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.22);
    });
    window.setTimeout(() => void context.close(), 500);
  } catch {
    // audio is a nice-to-have
  }
}

export function Celebration() {
  const { celebration, dismissCelebration } = useProgress();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (celebration && window.localStorage.getItem("ai-compass:sound") === "on") chime();
  }, [celebration]);

  const pieces = useMemo(() => Array.from({ length: 24 }, (_, index) => ({
    left: (index * 41 + 7) % 100,
    delay: (index % 8) * 0.07,
    duration: 1.4 + (index % 5) * 0.22,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    size: 6 + (index % 3) * 3
  })), []);

  if (!celebration) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-24">
      {!reducedMotion && pieces.map((piece, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 1.4,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`
          }}
        />
      ))}
      <div role="status" aria-live="polite" className="pointer-events-auto mx-4 max-w-sm border border-line bg-paper p-7 text-center shadow-xl">
        <p className="text-2xl">{celebration.kind === "shield" ? "🛡️" : "🎉"}</p>
        <p className="mt-2 font-display text-2xl italic text-ink">{celebration.title}</p>
        {celebration.detail && <p className="mt-1 text-sm text-ink/60">{celebration.detail}</p>}
        <button onClick={dismissCelebration} className="btn-ghost mt-3">Nice!</button>
      </div>
    </div>
  );
}
