"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Parallax({ children, speed = 0.2, className = "" }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : -speed * 140, reduced ? 0 : speed * 140]);
  useEffect(() => setMounted(true), []);
  if (!mounted || reduced) return <div ref={ref} className={className}>{children}</div>;
  return <motion.div ref={ref} className={className} style={{ y }}>{children}</motion.div>;
}
