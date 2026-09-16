"use client";

import { motion, useReducedMotion } from "framer-motion";
import GridLoader from "@/components/smoothui/grid-loader";
import { useEffect, useState } from "react";

export function Preloader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced || sessionStorage.getItem("ai-compass:preloader")) return;
    setVisible(true);
    const started = performance.now();
    let frame = 0;
    let timeout = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 1200);
      setCount(Math.round(progress * 100));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else {
        sessionStorage.setItem("ai-compass:preloader", "1");
        timeout = window.setTimeout(() => setExiting(true), 120);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [reduced]);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  if (!visible) return null;
  return <motion.div
    className="fixed inset-0 z-[60] flex flex-col justify-between bg-ink p-6 text-paper sm:p-10"
    initial={{ y: 0 }}
    animate={{ y: exiting ? "-100%" : 0 }}
    transition={{ duration: exiting ? 0.6 : 0, ease: [0.22, 1, 0.36, 1] }}
    onAnimationComplete={() => { if (exiting) setVisible(false); }}
  >
    <div className="flex items-center justify-between">
      <p className="font-mono text-[10px] uppercase tracking-[.22em] text-paper/50">Loading the signal</p>
      <GridLoader mode="sequence" sequence={["cross", "corners", "checkerboard", "border", "breathing"]} color="#ff4f1f" size="lg" speed="fast" />
    </div>
    <div>
      <p className="font-display text-[clamp(3rem,10vw,9rem)] italic leading-none">AI Compass</p>
      <div className="mt-6 flex items-baseline justify-between border-t border-paper/20 pt-3 font-mono text-xs uppercase tracking-[.2em]">
        <span>Find your way</span><span>{String(count).padStart(2, "0")}</span>
      </div>
    </div>
  </motion.div>;
}
