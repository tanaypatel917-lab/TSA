"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });
  return <motion.div className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-accent" style={{ scaleX: reduced ? scrollYProgress : progress }} />;
}
