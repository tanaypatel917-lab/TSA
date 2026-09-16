"use client";
import type { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";
import { motion, useReducedMotion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function BadgeList({ badges }: { badges: typeof BADGES }) {
  const { state } = useProgress(); const reduced = useReducedMotion();
  return <Stagger className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">{badges.map((badge) => { const earned = state.badges.includes(badge.id); return <StaggerItem key={badge.id}><motion.div whileHover={earned ? { y: -4, rotate: -1 } : undefined} className={`aspect-square border-b border-r border-line p-6 ${earned ? "bg-lime" : "bg-paper"}`}>{earned ? <motion.span className="inline-block text-6xl" initial={reduced ? false : { scale: 1.6, rotate: -12, opacity: 0 }} whileInView={{ scale: 1, rotate: -2, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>{badge.icon}</motion.span> : <span className="text-6xl opacity-30 grayscale">{badge.icon}</span>}<h2 className="mt-8 font-display text-2xl italic">{badge.name}</h2><p className="mt-2 text-sm leading-relaxed text-ink/75">{badge.description}</p><p className="mt-6 font-mono text-[10px] uppercase tracking-wider">{earned ? "Earned" : "Locked"}</p></motion.div></StaggerItem>; })}</Stagger>;
}
