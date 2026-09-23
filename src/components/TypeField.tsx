"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useMotionPreference } from "./MotionPreferences";

const REACH = 260;
const PULL = 7;

export function TypeField() {
  const { reduced } = useMotionPreference();
  const path = usePathname();
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    let pointer = { x: -9999, y: -9999 };
    const lifted = new Set<HTMLElement>();
    let pulled: HTMLElement | null = null;
    const apply = () => {
      frame = 0;
      for (const element of document.querySelectorAll<HTMLElement>("[data-field]")) {
        const box = element.getBoundingClientRect();
        if (box.bottom < -REACH || box.top > window.innerHeight + REACH) continue;
        const gap = Math.hypot(pointer.x - (box.left + box.width / 2), pointer.y - (box.top + box.height / 2));
        const lift = Math.max(0, 1 - gap / REACH);
        if (lift > 0.01) { element.style.setProperty("--lift", lift.toFixed(3)); lifted.add(element); }
        else if (lifted.has(element)) { element.style.removeProperty("--lift"); lifted.delete(element); }
      }
      const target = (document.elementFromPoint(pointer.x, pointer.y) as HTMLElement | null)?.closest<HTMLElement>(".button-primary, .button-secondary");
      if (pulled && pulled !== target) { pulled.style.removeProperty("--mx"); pulled.style.removeProperty("--my"); pulled = null; }
      if (target) {
        const box = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${(((pointer.x - box.left) / box.width) - 0.5) * PULL}px`);
        target.style.setProperty("--my", `${(((pointer.y - box.top) / box.height) - 0.5) * PULL}px`);
        pulled = target;
      }
    };
    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const leave = () => { pointer = { x: -9999, y: -9999 }; if (!frame) frame = requestAnimationFrame(apply); };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      lifted.forEach((element) => element.style.removeProperty("--lift"));
      pulled?.style.removeProperty("--mx");
      pulled?.style.removeProperty("--my");
    };
  }, [reduced, path]);
  return null;
}
