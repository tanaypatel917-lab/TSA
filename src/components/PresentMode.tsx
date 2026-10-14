"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { lessonFigures } from "@/content/figures";
import type { Lesson, Module } from "@/content/types";
import { LessonFigure } from "./labs/LessonFigure";

type Figure = (typeof lessonFigures)[string][number];
type Slide = { kind: "cover" } | { kind: "beat"; position: number } | { kind: "lab"; figure: Figure } | { kind: "takeaways" } | { kind: "end" };

const pad = (value: number) => String(value).padStart(2, "0");
const FIELDS = "input, textarea, select, [contenteditable='true']";
const FOCUSABLE = "a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])";

export function PresentMode({ module, lesson, index, question, sections, figures }: { module: Module; lesson: Lesson; index: number; question?: string; sections?: string[]; figures: Figure[] }) {
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState(1);
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const wasFull = useRef(false);
  const slides: Slide[] = [
    { kind: "cover" },
    ...lesson.body.flatMap((_, position): Slide[] => [{ kind: "beat", position }, ...figures.filter((figure) => figure.after === position).map((figure): Slide => ({ kind: "lab", figure }))]),
    { kind: "takeaways" },
    { kind: "end" }
  ];
  const last = slides.length - 1;
  const slide = slides[Math.min(at, last)];

  const go = useCallback((next: number) => {
    setAt((current) => {
      const target = Math.max(0, Math.min(last, next));
      setDir(target >= current ? 1 : -1);
      return target;
    });
  }, [last]);

  const close = useCallback(() => {
    setOpen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    window.setTimeout(() => opener.current?.focus(), 0);
  }, []);

  function start() {
    setAt(0);
    setDir(1);
    setOpen(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    root.dataset.presenting = "true";
    dialog.current?.focus();
    const onFull = () => {
      if (document.fullscreenElement) wasFull.current = true;
      else if (wasFull.current) { wasFull.current = false; close(); }
    };
    document.addEventListener("fullscreenchange", onFull);
    return () => {
      root.style.overflow = overflow;
      delete root.dataset.presenting;
      wasFull.current = false;
      document.removeEventListener("fullscreenchange", onFull);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      const target = event.target as HTMLElement | null;
      if (event.key === "Tab" && dialog.current) {
        const focusable = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => element.offsetParent !== null);
        const first = focusable[0];
        const end = focusable[focusable.length - 1];
        if (!first) return;
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); end.focus(); }
        else if (!event.shiftKey && document.activeElement === end) { event.preventDefault(); first.focus(); }
        return;
      }
      if (target?.closest?.(FIELDS)) return;
      const onControl = Boolean(target?.closest?.("button, a"));
      if (event.key === "ArrowRight" || event.key === "PageDown" || (event.key === " " && !onControl)) { event.preventDefault(); go(at + 1); }
      else if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); go(at - 1); }
      else if (event.key === "Home") { event.preventDefault(); go(0); }
      else if (event.key === "End") { event.preventDefault(); go(last); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, at, last, go, close]);

  return <>
    <button ref={opener} type="button" className="present-open" onClick={start}><span aria-hidden="true">▶</span> Present</button>
    {open && createPortal(<div ref={dialog} className="present" role="dialog" aria-modal="true" aria-label={`Presenting: ${lesson.title}`} tabIndex={-1}>
      <div className="present-stage" data-lenis-prevent>
        <span className="present-ghost" aria-hidden="true">{pad(at + 1)}</span>
        <div key={at} className="present-slide" data-kind={slide.kind} data-dir={dir}>
          {slide.kind === "cover" && <>
            <p className="present-kicker">{module.title} · Lesson {pad(index + 1)}</p>
            <h2 className="present-title">{lesson.title}</h2>
            {question && <p className="present-question">{question}</p>}
            <p className="present-meta">{lesson.minutes} min · {slides.length} slides · → to begin</p>
          </>}
          {slide.kind === "beat" && <>
            <p className="present-beat">{pad(slide.position + 1)} / {pad(lesson.body.length)}</p>
            {sections?.[slide.position] && <h2>{sections[slide.position]}</h2>}
            <p className="present-body">{lesson.body[slide.position]}</p>
          </>}
          {slide.kind === "lab" && <>
            <p className="present-kicker">Try it together</p>
            <div className="present-lab"><LessonFigure kind={slide.figure.kind} /></div>
          </>}
          {slide.kind === "takeaways" && <>
            <p className="present-kicker">Key takeaways</p>
            <h2>Take this with you.</h2>
            <ol className="present-takeaways">{lesson.keyTakeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}</ol>
          </>}
          {slide.kind === "end" && <>
            <p className="present-kicker">Discuss</p>
            <h2 className="present-title">Questions?</h2>
            <p className="present-question">Up next: the {module.title} quiz, {module.quiz.length} questions.</p>
          </>}
        </div>
      </div>
      <div className="present-bar">
        <button type="button" onClick={close}>Exit <span aria-hidden="true">✕</span></button>
        <span className="present-progress" aria-hidden="true"><i style={{ width: `${(at / last) * 100}%` }} /></span>
        <span className="present-count" aria-live="polite">Slide {at + 1} of {slides.length}</span>
        <button type="button" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous slide">←</button>
        <button type="button" onClick={() => go(at + 1)} disabled={at === last} aria-label="Next slide">→</button>
      </div>
    </div>, document.body)}
  </>;
}
