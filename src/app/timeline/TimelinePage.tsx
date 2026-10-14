"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { referenceById, referenceNumber } from "@/content/references";
import { timelineEras } from "@/content/timeline";
import { LostToken } from "@/components/LostToken";
import { TimelineParticles } from "@/components/three/TimelineParticles";
import { useMotionPreference } from "@/components/MotionPreferences";

const timelineItems = timelineEras.flatMap((era) => era.entries.map((entry, index) => {
  const key = typeof entry.year === "number" ? String(entry.year) : `next-${index + 1}`;
  const year = typeof entry.year === "number" ? String(entry.year) : "NEXT";
  return {
    key,
    mark: entry.object?.mark ?? "?",
    caption: `${year} · ${(entry.object?.label ?? "YOUR TURN").toUpperCase()}`
  };
}));

function supportsWebGL() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  if (context) context.getExtension("WEBGL_lose_context")?.loseContext();
  return Boolean(context);
}

export function TimelinePage() {
  const [activeEra, setActiveEra] = useState("past");
  const [activeEntry, setActiveEntry] = useState(timelineItems[0]?.key ?? "");
  const [particlesEnabled, setParticlesEnabled] = useState(false);
  const { reduced, ready } = useMotionPreference();
  const currentParticle = timelineItems.find((item) => item.key === activeEntry) ?? timelineItems[0];

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".timeline-era"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveEra(visible[0].target.id);
    }, { rootMargin: "-22% 0px -68% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || reduced) {
      setParticlesEnabled(false);
      return;
    }
    const wide = window.matchMedia("(min-width: 1200px)");
    const update = () => setParticlesEnabled(wide.matches && supportsWebGL());
    update();
    wide.addEventListener("change", update);
    return () => wide.removeEventListener("change", update);
  }, [ready, reduced]);

  useEffect(() => {
    let frame = 0;
    const updateActiveEntry = () => {
      frame = 0;
      const center = window.innerHeight / 2;
      let closest: HTMLElement | undefined;
      let closestDistance = Number.POSITIVE_INFINITY;
      for (const entry of document.querySelectorAll<HTMLElement>(".timeline-entry")) {
        const bounds = entry.getBoundingClientRect();
        const distance = Math.abs((bounds.top + bounds.bottom) / 2 - center);
        if (distance < closestDistance) {
          closest = entry;
          closestDistance = distance;
        }
      }
      const key = closest?.id.replace("timeline-entry-", "");
      if (key) setActiveEntry((current) => current === key ? current : key);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(updateActiveEntry);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const disableParticles = useCallback((readyState: boolean) => {
    if (!readyState) setParticlesEnabled(false);
  }, []);

  return (
    <div className={`timeline-layout shell${particlesEnabled ? " timeline-layout--particles" : ""}`}>
      <header className="timeline-hero">
        <p className="timeline-eyebrow">A living history</p>
        <h1>AI, one sentence a year.</h1>
        <p className="timeline-deck">From 1950 to whatever you build next.</p>
      </header>
      <aside className="timeline-nav-wrap">
        <nav className="timeline-nav" aria-label="Timeline eras">
          {timelineEras.map((era) => (
            <a key={era.id} href={`#${era.id}`} aria-current={activeEra === era.id ? "true" : undefined} onClick={() => setActiveEra(era.id)}>
              {era.title}
            </a>
          ))}
        </nav>
      </aside>
      {particlesEnabled && currentParticle && <aside className="timeline-particles-column" aria-hidden="true">
        <TimelineParticles mark={currentParticle.mark} onReady={disableParticles} />
        <p className="timeline-particles-caption">{currentParticle.caption}</p>
      </aside>}
      <div className="timeline-content">
        {timelineEras.map((era) => (
          <section key={era.id} id={era.id} className="timeline-era" aria-labelledby={`${era.id}-heading`}>
            <h2 id={`${era.id}-heading`}><span>{era.title}</span><span className="timeline-rule" aria-hidden="true" /></h2>
            <ol className="timeline-list">
              {era.entries.map((entry, index) => {
                const key = typeof entry.year === "number" ? String(entry.year) : `next-${index + 1}`;
                const reference = entry.refId ? referenceById(entry.refId) : undefined;
                return (
                  <li key={key} id={`timeline-entry-${key}`} className="timeline-entry" data-reveal={index}>
                    <div className="timeline-date">
                      <span className="timeline-dots" aria-hidden="true" />
                      {typeof entry.year === "number"
                        ? <time dateTime={String(entry.year)}>{entry.year}</time>
                        : <><span className="timeline-question" aria-hidden="true">?</span><span className="sr-only">Next</span></>}
                    </div>
                    <div className="timeline-copy">
                      {entry.object && <span className="timeline-object" aria-hidden="true"><b>{entry.object.mark}</b><small>{entry.object.label}</small></span>}
                      <h3>{entry.sentence}</h3>
                      {entry.why && <p className="timeline-why">{entry.why}</p>}
                      {reference && <p className="timeline-source source-line">Source: <Link href={`/references#ref-${reference.id}`}>[{referenceNumber(reference.id)}] {reference.short}</Link></p>}
                      {entry.lesson && <Link className="timeline-lesson" href={entry.lesson.href}>{entry.lesson.label}</Link>}
                      {entry.year === 2017 && <div className="lost-token-context lost-token-context--timeline"><LostToken id="mask" /></div>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
