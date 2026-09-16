"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, value));
  const reduced = useReducedMotion();
  return <div className="relative"><div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink/75"><span>{label}</span><span>{Math.round(safe)}%</span></div><div role="progressbar" aria-label={label} aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} className="relative h-0.5 bg-line"><motion.span className="block h-full bg-accent" initial={reduced ? false : { width: 0 }} animate={{ width: `${safe}%` }} transition={{ duration: reduced ? 0 : .9, ease: [0.22, 1, 0.36, 1] }} /></div><span aria-hidden="true" className="pointer-events-none absolute -top-3 right-0"><svg width="28" height="28" viewBox="0 0 28 28" className="text-ink"><circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeOpacity="0.2" /><motion.g style={{ originX: "14px", originY: "14px" }} initial={reduced ? false : { rotate: -90 }} animate={{ rotate: -90 + (safe / 100) * 180 }} transition={{ type: "spring", stiffness: 120, damping: 18 }}><line x1="14" y1="14" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" /><circle cx="14" cy="14" r="1.5" fill="currentColor" /></motion.g></svg></span></div>;
}
