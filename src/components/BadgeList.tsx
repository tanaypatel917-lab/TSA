"use client";
import type { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";

export function BadgeList({ badges }: { badges: typeof BADGES }) {
  const { state } = useProgress();
  return <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{badges.map((badge) => { const earned = state.badges.includes(badge.id); return <div key={badge.id} className={`card ${earned ? "border-amber-300 bg-amber-50" : "opacity-60"}`}><span className="text-4xl">{earned ? badge.icon : "🔒"}</span><h2 className="mt-4 text-lg font-bold">{badge.name}</h2><p className="mt-1 text-sm text-slate-600">{badge.description}</p><p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">{earned ? "Earned" : "Locked"}</p></div>; })}</div>;
}
