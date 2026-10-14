"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "./MotionPreferences";

export function ScrollRead({ text }: { text: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionPreference();
  const words = text.split(/\s+/);
  const [read, setRead] = useState(words.length);

  useEffect(() => {
    const element = host.current;
    if (reduced || !element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      const view = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (view * 0.85 - top) / (height + view * 0.3)));
      setRead(Math.round(progress * words.length));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reduced, words.length]);

  const shown = reduced ? words.length : read;
  return <span ref={host} className="scroll-read">{words.map((word, index) => <span key={index} data-read={index < shown}>{word}{index < words.length - 1 ? " " : ""}</span>)}</span>;
}
