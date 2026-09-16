"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    setMounted(true);
    const timeout = window.setTimeout(() => setFallback(true), 1500);
    return () => window.clearTimeout(timeout);
  }, []);
  if (!mounted || reduced) return <div className={className}>{children}</div>;
  return <motion.div className={className} initial={{ opacity: 0, y: 24 }} animate={fallback ? { opacity: 1, y: 0 } : undefined} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
