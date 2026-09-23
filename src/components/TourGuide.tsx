"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { tourStops } from "@/content/tour";

export const TOUR_KEY = "wordplay:tour:v1";
export const TOUR_EVENT = "wordplay:tour";
const normalize = (path: string) => (path.endsWith("/") ? path : `${path}/`);

export function startTour() {
  window.dispatchEvent(new CustomEvent(TOUR_EVENT));
}

export function TourButton({ className = "button-secondary", label = "Take the 2-minute tour" }: { className?: string; label?: string }) {
  return <button type="button" className={className} onClick={startTour}>{label} <span aria-hidden="true">→</span></button>;
}

export function TourGuide() {
  const router = useRouter();
  const path = normalize(usePathname());
  const [step, setStep] = useState<number | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const stop = step === null ? null : tourStops[step];
  const here = !!stop && normalize(stop.path) === path;

  const save = useCallback((next: number | null) => {
    setStep(next);
    try { if (next === null) sessionStorage.removeItem(TOUR_KEY); else sessionStorage.setItem(TOUR_KEY, String(next)); } catch {}
  }, []);

  const go = useCallback((next: number) => {
    save(next);
    const target = normalize(tourStops[next].path);
    if (target !== path) router.push(tourStops[next].path);
  }, [path, router, save]);

  useEffect(() => {
    try {
      const saved = Number(sessionStorage.getItem(TOUR_KEY));
      if (sessionStorage.getItem(TOUR_KEY) !== null && saved >= 0 && saved < tourStops.length) setStep(saved);
    } catch {}
    const begin = () => go(0);
    window.addEventListener(TOUR_EVENT, begin);
    return () => window.removeEventListener(TOUR_EVENT, begin);
  }, [go]);

  useEffect(() => {
    if (!stop || !here) return;
    let element: HTMLElement | null = null;
    let tries = 0;
    const timer = window.setInterval(() => {
      element = document.querySelector<HTMLElement>(stop.target);
      tries += 1;
      if (!element && tries < 30) return;
      window.clearInterval(timer);
      if (!element) return;
      element.dataset.tour = "on";
      const reduced = document.documentElement.dataset.motion !== "full";
      element.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      heading.current?.focus({ preventScroll: true });
    }, 100);
    return () => { window.clearInterval(timer); if (element) delete element.dataset.tour; };
  }, [stop, here]);

  if (!stop || step === null) return null;
  const last = step === tourStops.length - 1;
  return <aside className="tour-card" aria-labelledby="tour-title" data-here={here}>
    <div className="tour-progress" aria-hidden="true">{tourStops.map((item, index) => <span key={item.path} data-on={index <= step} />)}</div>
    <p className="tour-kicker">Tour · Stop {step + 1} of {tourStops.length}</p>
    <h2 id="tour-title" ref={heading} tabIndex={-1}>{stop.title}</h2>
    <p className="tour-text">{here ? stop.text : "You left the tour route. Jump back to this stop whenever you like."}</p>
    <div className="tour-actions">
      {step > 0 && <button type="button" className="tour-back" onClick={() => go(step - 1)}>Back</button>}
      {!here ? <button type="button" className="button-primary" onClick={() => go(step)}>Go to this stop <span aria-hidden="true">→</span></button>
        : last ? <button type="button" className="button-primary" onClick={() => save(null)}>Finish tour <span aria-hidden="true">✓</span></button>
        : <button type="button" className="button-primary" onClick={() => go(step + 1)}>Next stop <span aria-hidden="true">→</span></button>}
      <button type="button" className="tour-close" onClick={() => save(null)} aria-label="End the tour">×</button>
    </div>
  </aside>;
}
