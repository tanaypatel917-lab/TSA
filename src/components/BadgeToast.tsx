"use client";
import { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";
import { ModuleGlyph } from "@/components/ModuleGlyph";
import { motion, useReducedMotion } from "framer-motion";
import { SparklesText } from "@/components/magicui/SparklesText";

export function BadgeToast() {
  const { newBadgeToast } = useProgress();
  const reduced = useReducedMotion();
  if (!newBadgeToast.length) return null;
  const badge = BADGES.find((item) => item.id === newBadgeToast[0]);
  const moduleId = newBadgeToast[0].replace(/^module-/, "");
  return <motion.div aria-live="polite" initial={reduced ? false : { y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 20 }} className="fixed bottom-5 right-5 z-50 max-w-sm border border-ink bg-lime px-5 py-4 text-ink"><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em]">New badge unlocked</p><p className="mt-2 flex items-center gap-3 font-display text-2xl italic"><motion.span animate={{ rotate: reduced ? 0 : 360 }} transition={{ duration: .7 }}><ModuleGlyph moduleId={moduleId} className="h-8 w-8 shrink-0" /></motion.span><SparklesText sparklesCount={4} colors={{ first: "#b02a08", second: "#c8f560" }} className="text-2xl font-display italic">{badge?.name ?? newBadgeToast[0]}</SparklesText></p><p className="mt-1 text-sm text-ink/70">{badge?.description}</p></motion.div>;
}
