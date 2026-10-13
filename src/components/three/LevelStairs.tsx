"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useMotionPreference } from "../MotionPreferences";

const HOP = 760, REST = 1800, WAIT = 0.38;

export function LevelStairs({ levels }: { levels: readonly string[] }) {
  const host = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const element = host.current;
    const scene = element?.firstElementChild as HTMLElement | null;
    if (!element || !scene) return;
    const steps = Array.from(element.querySelectorAll<HTMLElement>(".stair"));
    const last = steps.length - 1;
    const paint = (from: number, part: number, squash: number) => {
      const current = part > 0.5 ? from + 1 : from;
      steps.forEach((step, index) => {
        const state = index === current ? "now" : index < current ? "lit" : "dim";
        if (step.dataset.state !== state) step.dataset.state = state;
      });
      scene.style.setProperty("--hx", (from + part).toFixed(3));
      scene.style.setProperty("--jump", Math.sin(part * Math.PI).toFixed(3));
      scene.style.setProperty("--squash", squash.toFixed(3));
    };
    if (reduced) { paint(1, 0, 1); scene.style.setProperty("--tilt", "0"); return; }

    let tilt = 0, target = 0, visible = true, frame = 0;
    const started = performance.now();
    const cycle = steps.length * HOP + REST;
    const move = (event: PointerEvent) => { const box = element.getBoundingClientRect(); target = ((event.clientX - box.left) / box.width) * 2 - 1; };
    const leave = () => { target = 0; };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    seen.observe(element);
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!visible) return;
      const segment = (Math.max(0, now - started) % cycle) / HOP;
      const from = Math.min(last, Math.floor(segment));
      const local = segment - from;
      const part = from >= last ? 0 : Math.min(1, Math.max(0, (local - WAIT) / (1 - WAIT)));
      const squash = from >= last && local > 1 ? 1 : local < WAIT ? 1 - Math.sin((local / WAIT) * Math.PI) * 0.12 : 1 + Math.sin(part * Math.PI) * 0.07;
      paint(from, part, squash);
      tilt += (target - tilt) * 0.08;
      scene.style.setProperty("--tilt", tilt.toFixed(3));
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
    };
  }, [reduced, levels.length]);

  return <div ref={host} className="stairs3d" aria-hidden="true">
    <div className="stairs-scene" style={{ "--n": levels.length } as CSSProperties}>
      {levels.map((name, index) => <div key={name} className="stair" data-state={index === 1 ? "now" : index < 1 ? "lit" : "dim"} style={{ "--i": index } as CSSProperties}>
        <i className="stair-top" /><i className="stair-side" />
        <div className="stair-front"><b>{String(index + 1).padStart(2, "0")}</b><span>{name}</span></div>
      </div>)}
      <span className="stair-hopper"><span>?</span></span>
    </div>
  </div>;
}
