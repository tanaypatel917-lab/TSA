"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Module } from "@/content/types";
import { activityLabels, moduleVisuals } from "@/content/visuals";
import { chapterMinutes, chapterProgress, chapterSteps } from "@/engine/chapters";
import { useMotionPreference } from "./MotionPreferences";
import { useProgress } from "@/state/ProgressProvider";

const tones = ["ink", "clay", "sky", "paper", "lake"] as const;

export function ChapterIndex({ modules }: { modules: Module[] }) {
  const { state, hydrated } = useProgress();
  const { reduced } = useMotionPreference();
  const rail = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [scrub, setScrub] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
    const update = () => setScrub(!reduced && wide.matches);
    update();
    wide.addEventListener("change", update);
    return () => wide.removeEventListener("change", update);
  }, [reduced]);

  useEffect(() => {
    const element = rail.current;
    const list = track.current;
    if (!scrub || !element || !list) return;
    let frame = 0;
    let last = -1;
    const measure = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const span = Math.max(1, box.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -box.top / span));
      if (Math.abs(progress - last) < 0.0005) return;
      last = progress;
      const travel = Math.max(0, list.scrollWidth - window.innerWidth);
      element.style.setProperty("--rail-p", progress.toFixed(4));
      list.style.transform = `translate3d(${(-progress * travel).toFixed(1)}px, 0, 0)`;
      const position = progress * (modules.length - 1);
      list.querySelectorAll<HTMLElement>(".rail-panel").forEach((panel, index) => panel.style.setProperty("--near", Math.max(0, 1 - Math.abs(position - index)).toFixed(3)));
      setActive(Math.round(position));
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      list.style.transform = "";
    };
  }, [scrub, modules.length]);

  const reveal = (index: number) => {
    const element = rail.current;
    if (!scrub || !element) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const span = element.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (span * index) / Math.max(1, modules.length - 1), behavior: "instant" as ScrollBehavior });
  };
  const tilt = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!scrub) return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--tx", ((event.clientX - box.left) / box.width - 0.5).toFixed(3));
    event.currentTarget.style.setProperty("--ty", ((event.clientY - box.top) / box.height - 0.5).toFixed(3));
  };
  const untilt = (event: PointerEvent<HTMLAnchorElement>) => { event.currentTarget.style.setProperty("--tx", "0"); event.currentTarget.style.setProperty("--ty", "0"); };

  return <div ref={rail} className="rail" data-mode={scrub ? "scrub" : "list"} style={{ "--count": modules.length } as CSSProperties}><div className={scrub ? "rail-sticky" : "rail-sticky shell"}><div className="rail-head" aria-hidden="true"><span className="rail-count"><strong>{String(active + 1).padStart(2, "0")}</strong> / {String(modules.length).padStart(2, "0")}</span><span className="rail-hint">Scroll to scrub through the chapters</span><span className="rail-bar"><i /></span></div><ol ref={track} className="chapter-index">{modules.map((module, index) => {
    const visual = moduleVisuals[module.id];
    const progress = hydrated ? chapterProgress(state, module) : null;
    const steps = hydrated ? chapterSteps(state, module) : [];
    const fill = steps.length ? steps.filter((step) => step.done).length / steps.length : 0;
    return <li key={module.id} data-reveal={scrub ? undefined : index}><Link href={`/modules/${module.slug}`} className="chapter-row rail-panel" data-tone={tones[index % tones.length]} style={{ "--fill": fill } as CSSProperties} onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) reveal(index); }} onPointerMove={tilt} onPointerLeave={untilt}><span className="chapter-number">{String(index + 1).padStart(2, "0")}</span><span className="chapter-question">{visual.question}</span><span className="chapter-meta"><strong>{module.title}</strong><span>{module.tagline}</span></span><span className="chapter-row-facts"><span>{module.lessons.length} lessons · {chapterMinutes(module)} min</span><span>{activityLabels[module.activity.kind]} · Quiz</span>{progress && <span className="chapter-status" data-state={progress.status}>{progress.label}</span>}</span><span className="rail-lessons" aria-hidden="true">{module.lessons.map((lesson, position) => <span key={lesson.id} data-read={hydrated && state.completedLessons.includes(`${module.id}/${lesson.id}`)}><b>{String(position + 1).padStart(2, "0")}</b>{lesson.title}</span>)}</span><span className="chapter-mark" aria-hidden="true"><span className="rail-mark-line">{visual.mark}</span><span className="rail-mark-ink">{visual.mark}</span></span><span className="chapter-arrow" aria-hidden="true">↗</span></Link></li>;
  })}</ol></div></div>;
}
