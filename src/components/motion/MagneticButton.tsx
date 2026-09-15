"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

export function MagneticButton({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 320, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 320, damping: 18 });
  function move(event: React.MouseEvent<HTMLAnchorElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    x.set((event.clientX - (bounds.left + bounds.width / 2)) * 0.15);
    y.set((event.clientY - (bounds.top + bounds.height / 2)) * 0.15);
  }
  return <motion.a ref={ref} href={href} className="btn-pill group" style={{ x, y }} onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0); }} data-cursor="hover">{children}<span className="ml-3 inline-block transition-transform group-hover:translate-x-1">↗</span></motion.a>;
}
