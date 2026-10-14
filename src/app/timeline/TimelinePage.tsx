"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { referenceById, referenceNumber } from "@/content/references";
import { timelineEras } from "@/content/timeline";

export function TimelinePage() {
  const [activeEra, setActiveEra] = useState("past");

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".timeline-era"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveEra(visible[0].target.id);
    }, { rootMargin: "-22% 0px -68% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="timeline-layout shell">
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
