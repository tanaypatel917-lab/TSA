"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const hidden = { opacity: 0, y: 20 };
const shown = { opacity: 1, y: 0 };

export function Stagger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <motion.div
    className={className}
    initial={mounted && !reduced ? "hidden" : false}
    animate="show"
    variants={{ hidden, show: { transition: { staggerChildren: reduced ? 0 : 0.08 } } }}
  >
    {children}
  </motion.div>;
}

export function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} variants={reduced ? undefined : { hidden, show: shown }} transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
