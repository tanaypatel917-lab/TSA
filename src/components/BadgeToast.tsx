"use client";

import { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";

export function BadgeToast() {
  const { newBadgeToast } = useProgress();
  if (!newBadgeToast.length) return null;
  const badge = BADGES.find((item) => item.id === newBadgeToast[0]);
  return (
    <div aria-live="polite" className="terminal frame fixed bottom-14 right-4 z-50 max-w-sm animate-rise px-5 py-4 normal-case">
      <p className="mono-label text-signal">:// New badge unlocked</p>
      <p className="mt-2 font-display text-xl font-black uppercase tracking-tight text-paper">{badge?.icon} {badge?.name ?? newBadgeToast[0]}</p>
      <p className="mt-1 font-display text-sm text-paper/80">{badge?.description}</p>
    </div>
  );
}
