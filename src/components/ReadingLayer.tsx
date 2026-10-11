"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useMotionPreference } from "./MotionPreferences";
import "./reading-layer.css";

const SCRAMBLE = ".section-heading h2, .lesson-reading h2, .takeaways h2, .spine h2, .human-judgment h2, .home-closing h2, .about-principles h2";
const GLYPHS = "▒░▓<>/{}[]#%&*+=?01";
const VOCAB = 50257;

function hash(text: string) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index++) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  return value >>> 0;
}

export function tokenize(word: string) {
  if (word.length <= 4) return [word];
  const parts: string[] = [];
  let rest = word;
  while (rest.length > 5) {
    let cut = 3;
    while (cut < 5 && !/[aeiouy]/i.test(rest[cut - 1])) cut++;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  parts.push(rest);
  return parts;
}

function wordAt(x: number, y: number) {
  const doc = document as Document & { caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null };
  let node: Node | null = null, offset = 0;
  if (doc.caretPositionFromPoint) { const caret = doc.caretPositionFromPoint(x, y); node = caret?.offsetNode ?? null; offset = caret?.offset ?? 0; }
  else if (document.caretRangeFromPoint) { const range = document.caretRangeFromPoint(x, y); node = range?.startContainer ?? null; offset = range?.startOffset ?? 0; }
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const host = node.parentElement;
  if (!host || host.closest("button, input, textarea, select, .reading-chip, [aria-hidden='true'], nav")) return null;
  const text = node.nodeValue ?? "";
  let start = offset, end = offset;
  while (start > 0 && /[\p{L}\p{N}'’-]/u.test(text[start - 1])) start--;
  while (end < text.length && /[\p{L}\p{N}'’-]/u.test(text[end])) end++;
  const word = text.slice(start, end).replace(/^[-'’]+|[-'’]+$/g, "");
  if (word.length < 2) return null;
  const range = document.createRange();
  range.setStart(node, start); range.setEnd(node, end);
  const box = range.getBoundingClientRect();
  if (x < box.left - 2 || x > box.right + 2 || y < box.top - 2 || y > box.bottom + 2) return null;
  return word;
}

export function ReadingLayer() {
  const { reduced } = useMotionPreference();
  const path = usePathname();
  const chip = useRef<HTMLDivElement>(null);
  const lines = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (reduced || /^\/(intro|play)/.test(path) || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const label = chip.current, svg = lines.current;
    if (!label || !svg) return;
    let frame = 0, pointer = { x: 0, y: 0 }, shown = "", focus: HTMLElement | null = null;

    const draw = () => {
      svg.replaceChildren();
      if (!focus) return;
      const from = focus.getBoundingClientRect();
      const fx = from.left + from.width / 2, fy = from.top + from.height / 2;
      const scope = focus.closest("article, main") ?? document.body;
      const targets = Array.from(scope.querySelectorAll<HTMLElement>(".term-trigger, h1, .lesson-reading h2"))
        .filter((element) => element !== focus && element.textContent !== focus?.textContent)
        .map((element) => ({ element, box: element.getBoundingClientRect() }))
        .filter(({ box }) => box.bottom > 0 && box.top < window.innerHeight && box.width > 0)
        .slice(0, 9);
      for (const { element, box } of targets) {
        const weight = 0.25 + (hash((focus.textContent ?? "") + (element.textContent ?? "")) % 75) / 100;
        const tx = box.left + Math.min(box.width, 160) / 2, ty = box.top + box.height / 2;
        const lift = Math.min(160, Math.abs(tx - fx) * 0.35 + 40);
        const curve = document.createElementNS("http://www.w3.org/2000/svg", "path");
        curve.setAttribute("d", `M${fx},${fy} C${fx},${fy - lift} ${tx},${ty - lift} ${tx},${ty}`);
        curve.setAttribute("stroke-width", (weight * 3).toFixed(2));
        curve.style.opacity = weight.toFixed(2);
        svg.append(curve);
        const tag = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tag.setAttribute("x", String(tx)); tag.setAttribute("y", String(ty - 12));
        tag.textContent = weight.toFixed(2);
        svg.append(tag);
      }
    };

    const update = () => {
      frame = 0;
      label.style.transform = `translate3d(${pointer.x + 14}px, ${pointer.y - 44}px, 0)`;
      const word = wordAt(pointer.x, pointer.y);
      if (word !== shown) {
        shown = word ?? "";
        label.dataset.on = String(!!word);
        if (word) label.replaceChildren(...tokenize(word).map((piece) => {
          const token = document.createElement("span");
          token.textContent = piece;
          token.dataset.id = String(hash(piece.toLowerCase()) % VOCAB);
          return token;
        }));
      }
      if (focus) draw();
    };
    const move = (event: PointerEvent) => { pointer = { x: event.clientX, y: event.clientY }; if (!frame) frame = requestAnimationFrame(update); };
    const over = (event: Event) => {
      const term = (event.target as HTMLElement | null)?.closest<HTMLElement>(".term-trigger");
      if (term === focus) return;
      focus = term ?? null; draw();
    };
    const scroll = () => { if (focus) draw(); };
    const hide = () => { label.dataset.on = "false"; shown = ""; focus = null; draw(); };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    window.addEventListener("scroll", scroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      window.removeEventListener("scroll", scroll);
      document.documentElement.removeEventListener("pointerleave", hide);
      hide();
    };
  }, [reduced, path]);

  useEffect(() => {
    if (reduced || !("IntersectionObserver" in window)) return;
    const timers = new Set<number>();
    const restore = new Set<() => void>();
    const run = (heading: HTMLElement) => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes: { node: Text; target: string }[] = [];
      while (walker.nextNode()) { const node = walker.currentNode as Text; if (node.nodeValue?.trim()) nodes.push({ node, target: node.nodeValue }); }
      if (!nodes.length) return;
      const fix = () => nodes.forEach(({ node, target }) => { node.nodeValue = target; });
      restore.add(fix);
      const start = performance.now(), length = 640;
      const tick = () => {
        const done = Math.min(1, (performance.now() - start) / length);
        const frameGlyph = Math.floor(performance.now() / 50);
        for (const { node, target } of nodes) node.nodeValue = done >= 1 ? target : target.split("").map((char, index) => char === " " || index / target.length < done * 1.15 - 0.15 ? char : GLYPHS[(index * 7 + frameGlyph) % GLYPHS.length]).join("");
        if (done < 1) timers.add(requestAnimationFrame(tick)); else restore.delete(fix);
      };
      tick();
    };
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      run(entry.target as HTMLElement);
    }), { rootMargin: "0px 0px -12% 0px" });
    const scan = () => document.querySelectorAll<HTMLElement>(SCRAMBLE).forEach((heading) => {
      if (heading.dataset.scrambled) return;
      heading.dataset.scrambled = "true";
      if (heading.getBoundingClientRect().top < window.innerHeight * 0.88) return;
      heading.setAttribute("aria-label", heading.textContent ?? "");
      observer.observe(heading);
    });
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { mutations.disconnect(); observer.disconnect(); timers.forEach((timer) => cancelAnimationFrame(timer)); restore.forEach((fix) => fix()); };
  }, [reduced, path]);

  return <div className="reading-layer" aria-hidden="true"><svg ref={lines} className="reading-lines" /><div ref={chip} className="reading-chip" data-on="false" /></div>;
}
