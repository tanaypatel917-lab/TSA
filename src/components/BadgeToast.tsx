"use client";

import { useEffect } from "react";
import { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";
import { useMotionPreference } from "./MotionPreferences";
import { BadgeBurst } from "./three/BadgeBurst";
import "./juice.css";

function thud() {
  try {
    const audio = new AudioContext();
    const now = audio.currentTime;
    const tone = audio.createOscillator(), gain = audio.createGain();
    tone.type = "triangle";
    tone.frequency.setValueAtTime(180, now);
    tone.frequency.exponentialRampToValueAtTime(48, now + 0.28);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    tone.connect(gain).connect(audio.destination);
    tone.start(now); tone.stop(now + 0.42);
    tone.onended = () => void audio.close();
  } catch {}
}

export function BadgeToast() {
  const { newBadgeToast, dismissBadgeToast } = useProgress();
  const { reduced } = useMotionPreference();
  const first = newBadgeToast[0];
  useEffect(() => { if (!first || reduced) return; window.setTimeout(thud, 260); }, [first, reduced]);
  const badge = BADGES.find((item) => item.id === first);
  return <div className="badge-toast-live" aria-live="polite" aria-atomic="true">
    {first && <>
      {!reduced && <div key={first} className="badge-stamp" aria-hidden="true"><BadgeBurst mark={badge?.mark ?? "*"} name={badge?.name ?? ""} /><span className="badge-stamp-disc"><span>{badge?.mark ?? "*"}</span><small>{badge?.name}</small></span></div>}
      <div className="badge-toast"><p>New badge unlocked</p><strong>{badge?.name ?? first}</strong><p>{badge?.description}</p><button aria-label="Dismiss badge notification" onClick={() => { const last = newBadgeToast.length === 1; dismissBadgeToast(); if (last) document.getElementById("main")?.focus({ preventScroll: true }); }}>×</button></div>
    </>}
  </div>;
}
