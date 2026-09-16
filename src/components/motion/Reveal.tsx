"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 1, y: 24 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={reduced ? undefined : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
