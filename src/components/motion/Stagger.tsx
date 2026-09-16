"use client";

import { motion, useReducedMotion } from "framer-motion";
import { createContext, useContext, useEffect, useState } from "react";

const hidden = { opacity: 0, y: 20 };
const shown = { opacity: 1, y: 0 };
const StaggerContext = createContext(false);

export function Stagger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || reduced) return <StaggerContext.Provider value={false}><div className={className}>{children}</div></StaggerContext.Provider>;
  return <StaggerContext.Provider value><motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-10%" }}
    variants={{ hidden, show: { transition: { staggerChildren: 0.08 } } }}
  >
    {children}
  </motion.div></StaggerContext.Provider>;
}

export function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const animated = useContext(StaggerContext) && !reduced;
  if (!animated) return <div className={className}>{children}</div>;
  return <motion.div className={className} variants={{ hidden, show: shown }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
