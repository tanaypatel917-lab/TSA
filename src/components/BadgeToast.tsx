"use client";

import { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";

export function BadgeToast() {
  const { newBadgeToast } = useProgress();
  if (!newBadgeToast.length) return null;
  const badge = BADGES.find((item) => item.id === newBadgeToast[0]);
  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl bg-ink px-5 py-4 text-white shadow-2xl">
      <p className="font-pixel text-xs font-bold uppercase tracking-widest text-amber-300">New badge unlocked</p>
      <p className="mt-1 font-pixel text-lg font-bold">{badge?.icon} {badge?.name ?? newBadgeToast[0]}</p>
      <p className="mt-1 text-sm text-slate-200">{badge?.description}</p>
    </div>
  );
}
