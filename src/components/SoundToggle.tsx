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
      className="rounded-lg px-2 py-1 text-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
    >
      {on ? "🔊" : "🔇"}<span className="sr-only">{on ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
