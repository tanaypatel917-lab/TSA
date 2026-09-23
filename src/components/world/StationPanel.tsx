"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Module } from "@/content/types";
import { moduleVisuals } from "@/content/visuals";
import type { Station } from "@/content/world";
import { WORLD_XP } from "@/engine/progress";

type Props = { station: Station; module: Module; stamped: boolean; onStamp: () => void; onClose: () => void };

export function StationPanel({ station, module, stamped, onStamp, onClose }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [stampedNow, setStampedNow] = useState(false);
  const question = module.quiz[attempt % module.quiz.length];
  const visual = moduleVisuals[module.id];
  const answered = picked !== null;
  const correct = picked === question.answerIndex;

  useEffect(() => {
    heading.current?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex='-1']")).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keydown, true);
    return () => document.removeEventListener("keydown", keydown, true);
  }, [onClose]);

  function choose(index: number) {
    if (answered) return;
    setPicked(index);
    if (index === question.answerIndex && !stamped) { setStampedNow(true); onStamp(); }
  }

  function another() {
    setAttempt((value) => value + 1);
    setPicked(null);
  }

  return createPortal(<div className="station-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialog} className="station-panel" role="dialog" aria-modal="true" aria-labelledby="station-title" data-module={module.id}>
      <header className="station-head">
        <p>Station {station.number} · {visual.chapter}</p>
        <span className="station-stamp" data-stamped={stamped} aria-hidden="true">{stamped ? "Stamped" : visual.mark}</span>
        <h2 id="station-title" ref={heading} tabIndex={-1}>{visual.question}</h2>
        <p className="station-lede"><strong>{module.title}.</strong> {module.tagline}</p>
      </header>
      <section className="station-check" aria-labelledby="station-check-title">
        <h3 id="station-check-title">{stamped && !stampedNow ? "Practice question" : `Station check · +${WORLD_XP.stamp} XP`}</h3>
        <p className="station-question">{question.prompt}</p>
        <div className="station-choices">
          {question.choices.map((choice, index) => {
            const state = !answered ? undefined : index === question.answerIndex ? "correct" : index === picked ? "incorrect" : undefined;
            return <button key={`${question.id}-${index}`} type="button" className="answer-choice" data-state={state} aria-pressed={picked === index} disabled={answered} onClick={() => choose(index)}><span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{choice}</span>{state && <span className="answer-status">{state === "correct" ? "Correct answer" : "Your answer"}</span>}</button>;
          })}
        </div>
        <div className="station-feedback" role="status" aria-live="polite">
          {answered && <>
            <p><strong>{correct ? "Correct." : "Not quite."}</strong> {question.explanation}</p>
            {correct && stampedNow && <p className="station-earned">Station stamped · +{WORLD_XP.stamp} XP</p>}
            {correct && !stampedNow && stamped && <p className="station-earned">This station was already stamped.</p>}
          </>}
        </div>
        {answered && !correct && <button type="button" className="button-secondary" onClick={another}>Try another question</button>}
      </section>
      <footer className="station-actions">
        <Link href={`/modules/${module.slug}`} className="text-link">Open the chapter <span aria-hidden="true">↗</span></Link>
        <button type="button" className="button-primary" onClick={onClose}>Back to the world</button>
      </footer>
    </div>
  </div>, document.body);
}
