"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useMotionPreference } from "./MotionPreferences";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
type Transitioning = Document & { startViewTransition?: (update: () => Promise<void>) => { finished: Promise<void> } };

export function PageTransitions() {
  const router = useRouter();
  const path = usePathname();
  const { reduced } = useMotionPreference();
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!pending.current) return;
    const done = pending.current;
    pending.current = null;
    requestAnimationFrame(() => requestAnimationFrame(done));
  }, [path]);

  useEffect(() => {
    const doc = document as Transitioning;
    if (reduced || !doc.startViewTransition) return;
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download") || anchor.closest("[data-no-transition], [role='dialog']") || document.documentElement.dataset.introPage) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return;
      const route = (base && url.pathname.startsWith(base) ? url.pathname.slice(base.length) || "/" : url.pathname) + url.search + url.hash;
      event.preventDefault();
      const root = document.documentElement;
      root.style.setProperty("--vt-x", `${event.clientX}px`);
      root.style.setProperty("--vt-y", `${event.clientY}px`);
      root.dataset.transition = "page";
      const transition = doc.startViewTransition!(() => new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => { pending.current = null; resolve(); }, 1600);
        pending.current = () => { window.clearTimeout(timer); resolve(); };
        router.push(route);
      }));
      transition.finished.finally(() => { delete root.dataset.transition; });
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, [reduced, router]);

  return null;
}
