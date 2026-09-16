"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, value));
  const reduced = useReducedMotion();
  return <div><div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink/55"><span>{label}</span><span>{Math.round(safe)}%</span></div><div role="progressbar" aria-label={label} aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} className="h-0.5 bg-line"><motion.span className="block h-full bg-accent" initial={reduced ? false : { width: 0 }} animate={{ width: `${safe}%` }} transition={{ duration: reduced ? 0 : .9, ease: [0.22, 1, 0.36, 1] }} /></div></div>;
}
