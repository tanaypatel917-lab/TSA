"use client";

import { useEffect, useState } from "react";

const KEY = "ai-compass:sound";

export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(window.localStorage.getItem(KEY) === "on");
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    window.localStorage.setItem(KEY, next ? "on" : "off");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title={on ? "Mute celebration sounds" : "Enable celebration sounds"}
      className="py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
    >
      Sound {on ? "on" : "off"}<span className="sr-only">{on ? " — turn celebration sounds off" : " — turn celebration sounds on"}</span>
    </button>
  );
}
