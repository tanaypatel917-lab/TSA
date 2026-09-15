"use client";
import { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";
import { ModuleGlyph } from "@/components/ModuleGlyph";

export function BadgeToast() {
  const { newBadgeToast } = useProgress();
  if (!newBadgeToast.length) return null;
  const badge = BADGES.find((item) => item.id === newBadgeToast[0]);
  const moduleId = newBadgeToast[0].replace(/^module-/, "");
  return <div aria-live="polite" className="fixed bottom-5 right-5 z-50 max-w-sm border border-ink bg-lime px-5 py-4 text-ink"><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em]">New badge unlocked</p><p className="mt-2 flex items-center gap-3 font-display text-2xl italic"><ModuleGlyph moduleId={moduleId} className="h-8 w-8 shrink-0" />{badge?.name ?? newBadgeToast[0]}</p><p className="mt-1 text-sm text-ink/70">{badge?.description}</p></div>;
}
