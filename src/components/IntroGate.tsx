"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasSeenIntro, markIntroSeen, rememberIntroReturn } from "@/engine/intro";

export function IntroGate() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/intro")) { setOpen(false); return; }
    if (!hasSeenIntro()) {
      restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const blocked = [...document.querySelectorAll<HTMLElement>(".skip-link, .site-header, #main, .site-footer")];
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.introGate = "open";
    blocked.forEach((element) => { element.setAttribute("inert", ""); element.setAttribute("aria-hidden", "true"); });
    dialog.current?.querySelector<HTMLElement>(".intro-gate-title")?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); skip(); return; }
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = [...dialog.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      else if (!dialog.current.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keydown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      delete document.documentElement.dataset.introGate;
      blocked.forEach((element) => { element.removeAttribute("inert"); element.removeAttribute("aria-hidden"); });
      document.removeEventListener("keydown", keydown, true);
    };
  }, [open]);

  function skip() {
    markIntroSeen();
    setOpen(false);
    window.requestAnimationFrame(() => restoreFocus.current?.focus());
  }
  function play() {
    rememberIntroReturn(pathname);
    router.push("/intro");
  }

  if (!open) return null;
  return <div className="intro-gate" role="dialog" aria-modal="true" aria-labelledby="intro-gate-title" aria-describedby="intro-gate-copy" ref={dialog}><div className="intro-gate-card"><p className="section-index">First visit</p><h1 id="intro-gate-title" className="intro-gate-title" tabIndex={-1}>A question wants to move.</h1><p id="intro-gate-copy">Take a short scroll-driven introduction to Wordplay. It uses decorative 3D, keeps your progress on this device, and can be skipped at any time.</p><div className="intro-gate-actions"><button className="button-primary" onClick={play}>Play the introduction <span aria-hidden="true">↗</span></button><button className="button-secondary" onClick={skip}>Enter Wordplay</button></div><p className="small-note">Reduced-motion and narrow-screen visitors receive a still version.</p><span className="intro-gate-mark" aria-hidden="true">?</span></div></div>;
}
