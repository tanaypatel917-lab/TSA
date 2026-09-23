"use client";

import { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";

export function BadgeToast() {
  const { newBadgeToast, dismissBadgeToast } = useProgress();
  if (!newBadgeToast.length) return null;
  const badge = BADGES.find((item) => item.id === newBadgeToast[0]);
  return <div aria-live="polite" className="badge-toast"><p>New badge unlocked</p><strong>{badge?.name ?? newBadgeToast[0]}</strong><p>{badge?.description}</p><button aria-label="Dismiss badge notification" onClick={dismissBadgeToast}>×</button></div>;
}
