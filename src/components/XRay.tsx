"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { tokenize } from "./ReadingLayer";

type Highlights = { set: (name: string, value: unknown) => void; delete: (name: string) => void };
type HighlightCtor = new (...ranges: Range[]) => unknown;
const SKIP = "script, style, button, input, textarea, select, svg, canvas, [aria-hidden='true'], .xray-toggle";
const LIMIT = 30000;

function paint() {
  const root = document.querySelector("main");
  const css = (window as unknown as { CSS?: { highlights?: Highlights } }).CSS;
  const Highlight = (window as unknown as { Highlight?: HighlightCtor }).Highlight;
  if (!root || !css?.highlights || !Highlight) return 0;
  const even: Range[] = [], odd: Range[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (node) => !node.nodeValue?.trim() || node.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  let count = 0;
  for (let node = walker.nextNode(); node && count < LIMIT; node = walker.nextNode()) {
    const text = node.nodeValue ?? "";
    for (const match of text.matchAll(/[\p{L}\p{N}'’]+|[^\s\p{L}\p{N}]/gu)) {
      let start = match.index ?? 0;
      for (const piece of tokenize(match[0])) {
        const range = document.createRange();
        range.setStart(node, start); range.setEnd(node, start + piece.length);
        (count % 2 ? odd : even).push(range);
        start += piece.length; count++;
      }
    }
  }
  css.highlights.set("xray-a", new Highlight(...even));
  css.highlights.set("xray-b", new Highlight(...odd));
  return count;
}

function clear() {
  const css = (window as unknown as { CSS?: { highlights?: Highlights } }).CSS;
  css?.highlights?.delete("xray-a");
  css?.highlights?.delete("xray-b");
}

export function XRay() {
  const path = usePathname();
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const [count, setCount] = useState(0);
  const [tucked, setTucked] = useState(false);
  const hidden = /^\/(intro|play)/.test(path);
  useEffect(() => { setSupported("highlights" in CSS && "Highlight" in window); }, []);
  useEffect(() => {
    if (on || hidden) { setTucked(false); return; }
    let previousY = window.scrollY;
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - previousY;
        const atBottom = document.documentElement.scrollHeight - window.innerHeight - y <= 80;
        if (atBottom || delta < -8) setTucked(false);
        else if (y > 200 && delta > 8) setTucked(true);
        previousY = y;
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [on, hidden, path]);
  useEffect(() => {
    if (!on || hidden) { clear(); return; }
    let timer = 0;
    const run = () => setCount(paint());
    const first = window.setTimeout(run, 60);
    const observer = new MutationObserver(() => { window.clearTimeout(timer); timer = window.setTimeout(run, 280); });
    const root = document.querySelector("main");
    if (root) observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => { window.clearTimeout(first); window.clearTimeout(timer); observer.disconnect(); clear(); };
  }, [on, hidden, path]);
  if (!supported || hidden) return null;
  return <button type="button" className="xray-toggle" aria-label="X-ray" aria-pressed={on} data-tucked={tucked ? "true" : "false"} onFocus={() => setTucked(false)} onClick={() => setOn(!on)}>
    <span className="xray-dot" aria-hidden="true" />
    <span className="xray-label">X-ray{on && <span className="xray-count" role="status">≈ {count.toLocaleString("en-US")} tokens</span>}</span>
  </button>;
}
