"use client";
import { useEffect, useState } from "react";
import { useProgress } from "@/state/ProgressProvider";
import { levelFor } from "@/engine/levels";

function clock(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function Hud() {
  const { state, hydrated } = useProgress();
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    setTime(clock(new Date()));
    const timer = window.setInterval(() => setTime(clock(new Date())), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const level = levelFor(state.xp);
  return (
    <div aria-label="Progress status" role="status" className="terminal fixed inset-x-0 bottom-0 z-40 border-t border-signal/40 text-[11px] uppercase tracking-[0.12em]">
      <div className="shell flex h-10 items-center justify-between gap-4">
        <span className="hidden sm:inline">ai://compass <span aria-hidden="true" className="animate-blink">_</span></span>
        <span className="flex gap-4 sm:gap-6">
          <span>xp://{hydrated ? state.xp : 0}</span>
          <span>lvl://{level.name}</span>
          <span className="hidden sm:inline">streak://{state.streak.count}</span>
          <span className="hidden md:inline">badges://{state.badges.length}</span>
        </span>
        <span>local: {time}</span>
      </div>
    </div>
  );
}
