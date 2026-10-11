"use client";

import { useEffect, useRef } from "react";
import { glossary } from "@/content/glossary";
import { moduleVisuals } from "@/content/visuals";
import { BADGES } from "@/engine/badges";
import { useMotionPreference } from "./MotionPreferences";
import { useProgress } from "@/state/ProgressProvider";
import { BadgeCoins } from "./three/BadgeCoins";
import "./hero-stage.css";

export type HeroVariant = "orbit" | "cloud" | "stamps" | "echo";

type Item = { label: string; x: number; y: number; kind?: string; on?: boolean };

const ECHOES = 7;

function layout(variant: HeroVariant, mark: string, earned: string[]): Item[] {
  if (variant === "orbit") return Object.values(moduleVisuals).map((visual, index) => ({ label: visual.mark, x: 0, y: 0, kind: String(index + 1).padStart(2, "0") }));
  if (variant === "cloud") return glossary.slice(0, 16).map(({ term }, index) => {
    const col = index % 4, row = Math.floor(index / 4);
    return { label: term, x: 12 + col * 22 + (row % 2) * 6, y: 14 + row * 22 + (col % 2) * 6 };
  });
  if (variant === "stamps") return BADGES.slice(0, 12).map((badge, index) => ({ label: badge.mark, x: 16 + (index % 4) * 23 + (Math.floor(index / 4) % 2) * 6, y: 20 + Math.floor(index / 4) * 30, on: earned.includes(badge.id) }));
  return Array.from({ length: ECHOES }, (_, index) => ({ label: mark, x: 50, y: 52, kind: index === ECHOES - 1 ? "solid" : "line" }));
}

export function HeroStage({ variant, mark }: { variant: HeroVariant; mark: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPreference();
  const { state, hydrated } = useProgress();
  const items = layout(variant, mark, hydrated ? state.badges : []);

  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-stage-item]"));
    const center = root.querySelector<HTMLElement>("[data-stage-center]");
    const n = nodes.length;
    const pos = nodes.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const pointer = { x: 0, y: 0, inside: false };
    let box = root.getBoundingClientRect();
    let frame = 0;
    let visible = true;

    const home = (index: number, time: number) => {
      const w = box.width, h = box.height;
      if (variant === "orbit") {
        const angle = (index / n) * Math.PI * 2 + time * 0.00018;
        return { x: w * 0.5 + Math.cos(angle) * w * 0.36, y: h * 0.52 + Math.sin(angle) * h * 0.3, depth: (Math.sin(angle) + 1) / 2 };
      }
      const item = items[index];
      const bob = variant === "cloud" ? Math.sin(time * 0.0012 + index * 1.7) * 6 : 0;
      return { x: (item.x / 100) * w, y: (item.y / 100) * h + bob, depth: 1 };
    };

    const place = (time: number, still: boolean) => {
      const rx = pointer.inside ? pointer.x : box.width * 0.5 + Math.cos(time * 0.0007) * box.width * 0.16;
      const ry = pointer.inside ? pointer.y : box.height * 0.52 + Math.sin(time * 0.0011) * box.height * 0.12;
      nodes.forEach((node, index) => {
        const p = pos[index];
        if (variant === "echo") {
          const dx = (rx - box.width / 2) / box.width, dy = (ry - box.height * 0.52) / box.height;
          const depth = n - 1 - index;
          const tx = still ? -depth * 10 : dx * 60 - dx * depth * 70;
          const ty = still ? -depth * 8 : dy * 40 - dy * depth * 60;
          p.x += (tx - p.x) * (still ? 1 : 0.1);
          p.y += (ty - p.y) * (still ? 1 : 0.1);
          node.style.transform = `translate(-50%, -50%) translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${(dx * 10).toFixed(2)}deg)`;
          return;
        }
        const target = home(index, still ? 0 : time);
        if (still) { p.x = target.x; p.y = target.y; }
        else {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          const reach = variant === "stamps" ? 110 : 150;
          if (pointer.inside && dist < reach) {
            const push = (1 - dist / reach) * 2.4;
            p.vx += (dx / dist) * push; p.vy += (dy / dist) * push;
          }
          p.vx = (p.vx + (target.x - p.x) * 0.045) * 0.82;
          p.vy = (p.vy + (target.y - p.y) * 0.045) * 0.82;
          p.x += p.vx; p.y += p.vy;
          node.dataset.hot = String(pointer.inside && dist < 70);
        }
        const scale = variant === "orbit" ? 0.7 + target.depth * 0.45 : 1;
        const spin = variant === "stamps" ? (index * 37) % 24 - 12 + p.vx * 2 : p.vx * 0.8;
        node.style.transform = `translate(-50%, -50%) translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${spin.toFixed(2)}deg)`;
        if (variant === "orbit") node.style.zIndex = String(Math.round(target.depth * 10));
      });
      if (center) {
        const cx = pointer.inside ? (pointer.x / box.width - 0.5) : Math.cos(time * 0.0005) * 0.2;
        const cy = pointer.inside ? (pointer.y / box.height - 0.5) : Math.sin(time * 0.0008) * 0.2;
        center.style.transform = `translate(-50%, -50%) translate3d(${(cx * 40).toFixed(1)}px, ${(cy * 30).toFixed(1)}px, 0) rotate(${(cx * 14).toFixed(2)}deg)`;
      }
    };

    nodes.forEach((_, index) => { const target = home(index, 0); pos[index].x = variant === "echo" ? 0 : target.x; pos[index].y = variant === "echo" ? 0 : target.y; });
    place(0, true);
    if (reduced) return;

    const hero = root.closest(".page-hero") ?? root;
    const measure = () => { box = root.getBoundingClientRect(); };
    const move = (event: Event) => {
      const e = event as PointerEvent;
      box = root.getBoundingClientRect();
      pointer.x = e.clientX - box.left; pointer.y = e.clientY - box.top; pointer.inside = true;
    };
    const leave = () => { pointer.inside = false; };
    const tick = (time: number) => { if (visible) place(time, false); frame = requestAnimationFrame(tick); };
    const watch = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    watch.observe(root);
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    window.addEventListener("resize", measure);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      watch.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", measure);
    };
  }, [variant, reduced, items.length, items.map((item) => item.label + item.on).join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={stage} className="hero-stage" data-variant={variant} aria-hidden="true">
    {variant === "stamps" && hydrated && <BadgeCoins earned={state.badges} />}
    {variant === "orbit" && <><span className="hero-stage-ring" /><span className="hero-stage-center" data-stage-center="">?</span></>}
    {items.map((item, index) => <span key={`${item.label}-${index}`} className="hero-stage-item" data-stage-item="" data-kind={item.kind} data-on={item.on} style={variant === "echo" ? { opacity: 0.18 + (index / (ECHOES - 1)) * 0.82 } : undefined}>
      {variant === "orbit" && <small>{item.kind}</small>}{item.label}
    </span>)}
  </div>;
}
