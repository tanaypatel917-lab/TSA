"use client";
import type { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";

export function BadgeList({ badges }: { badges: typeof BADGES }) {
  const { state } = useProgress();
  return <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">{badges.map((badge) => { const earned = state.badges.includes(badge.id); return <div key={badge.id} className={`aspect-square p-6 ${earned ? "bg-lime" : "bg-paper opacity-50"}`}><span className="text-6xl">{earned ? badge.icon : "🔒"}</span><h2 className="mt-8 font-display text-2xl italic">{badge.name}</h2><p className="mt-2 text-sm leading-relaxed text-ink/65">{badge.description}</p><p className="mt-6 font-mono text-[10px] uppercase tracking-wider">{earned ? "Earned" : "Locked"}</p></div>; })}</div>;
}
