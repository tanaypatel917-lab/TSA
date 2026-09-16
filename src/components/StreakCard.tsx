"use client";

import { useProgress } from "@/state/ProgressProvider";

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function StreakCard() {
  const { state, hydrated } = useProgress();
  if (!hydrated) return null;

  const { count, lastDay, shields, longest } = state.streak;

  const days: { key: string; label: string; active: boolean }[] = [];
  const today = new Date();
  let streakStart: string | null = null;
  if (lastDay && count > 0) {
    const start = new Date(`${lastDay}T12:00:00`);
    start.setDate(start.getDate() - (count - 1));
    streakStart = dayKey(start);
  }
  for (let back = 6; back >= 0; back -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - back);
    const key = dayKey(date);
    const active = streakStart !== null && key >= streakStart && key <= lastDay;
    days.push({ key, label: date.toLocaleDateString(undefined, { weekday: "narrow" }), active });
  }

  return (
    <div className="card">
      <p className="eyebrow">Your streak</p>
      <div className="mt-3 flex items-end gap-3">
        <span className="text-4xl">🔥</span>
        <span className="text-4xl font-black">{count}</span>
        <span className="pb-1 text-sm font-bold text-slate-500">{count === 1 ? "day" : "days"}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">Longest: {longest} · {state.daysActive} {state.daysActive === 1 ? "day" : "days"} learned total</p>
      <div className="mt-3 flex items-center gap-1" aria-label={`${shields} of 2 streak shields`}>
        {[0, 1].map((slot) => (
          <span key={slot} className={slot < shields ? "text-xl" : "text-xl opacity-25 grayscale"} aria-hidden="true">🛡️</span>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500">Shields protect your streak if you miss a day. Earn one every 5 days.</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">Recent streak</p>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div key={day.key} className="flex flex-col items-center gap-1">
            <span className={`h-7 w-7 rounded-full ${day.active ? "bg-accent" : "bg-slate-200"}`} aria-label={`${day.key}${day.active ? " active" : ""}`} />
            <span className="text-[10px] font-bold text-slate-400">{day.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Every day you show up counts — even a single lesson keeps the compass moving.</p>
    </div>
  );
}
