"use client";

import { useEffect } from "react";

export function Cursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot"; ring.className = "cursor-ring";
    document.body.append(dot, ring);
    let tx = 0, ty = 0, x = 0, y = 0;
    const move = (event: MouseEvent) => { tx = event.clientX; ty = event.clientY; dot.style.transform = `translate3d(${tx - 5}px,${ty - 5}px,0)`; };
    const over = (event: MouseEvent) => { const target = event.target as HTMLElement; ring.classList.toggle("cursor-hover", Boolean(target.closest("[data-cursor='hover'],a,button"))); };
    const frame = () => { x += (tx - x) * 0.16; y += (ty - y) * 0.16; ring.style.transform = `translate3d(${x - 18}px,${y - 18}px,0)`; requestAnimationFrame(frame); };
    window.addEventListener("mousemove", move); document.addEventListener("mouseover", over); requestAnimationFrame(frame);
    return () => { window.removeEventListener("mousemove", move); document.removeEventListener("mouseover", over); dot.remove(); ring.remove(); };
  }, []);
  return null;
}
