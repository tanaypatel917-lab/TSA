"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function HeroDial() {
  const reduced = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });
  function move(event: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    rotateX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -16);
    rotateY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 16);
  }
  return <motion.div onMouseMove={move} onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }} style={{ rotateX, rotateY, transformPerspective: 800 }} className="compass-dial relative aspect-square w-full max-w-[520px] text-ink/80" aria-hidden="true"><svg viewBox="0 0 500 500" fill="none" className="h-full w-full"><circle cx="250" cy="250" r="210" stroke="currentColor" strokeWidth="1" /><circle cx="250" cy="250" r="150" stroke="currentColor" strokeWidth="1" strokeDasharray="2 12" /><circle cx="250" cy="250" r="72" stroke="currentColor" strokeWidth="1" /><path d="M250 20v460M20 250h460" stroke="currentColor" strokeWidth="1" /><path d="m250 52 26 198-26 198-26-198L250 52Z" fill="#b02a08" fillOpacity=".85" /><path d="m52 250 198-26 198 26-198 26L52 250Z" fill="#c8f560" fillOpacity=".72" /><circle cx="250" cy="250" r="10" fill="#111" /><text x="250" y="34" textAnchor="middle" fill="currentColor" fontFamily="monospace" fontSize="12">N</text><text x="250" y="480" textAnchor="middle" fill="currentColor" fontFamily="monospace" fontSize="12">S</text><text x="466" y="255" textAnchor="middle" fill="currentColor" fontFamily="monospace" fontSize="12">E</text><text x="34" y="255" textAnchor="middle" fill="currentColor" fontFamily="monospace" fontSize="12">W</text></svg><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[.3em]">Stay curious</span></motion.div>;
}
