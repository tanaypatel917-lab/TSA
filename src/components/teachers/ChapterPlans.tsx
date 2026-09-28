"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { modules } from "@/content";
import { bigIdeas, chapterPlans, PLAN_MINUTES } from "@/content/toolkit";
import { moduleVisuals } from "@/content/visuals";
import { chapterMinutes } from "@/engine/chapters";
import { printSection } from "../print";

const plans = chapterPlans.map((plan) => {
  const chapter = modules.find((item) => item.id === plan.moduleId)!;
  const reading = chapterMinutes(chapter);
  const rows: [string, number][] = [["Warm-up", PLAN_MINUTES.warmup], [`Read ${chapter.lessons.length} lessons`, reading], [chapter.activity.title, PLAN_MINUTES.activity], ["Discussion", PLAN_MINUTES.discussion], [`Quiz (${chapter.quiz.length} questions)`, PLAN_MINUTES.quiz]];
  const total = rows.reduce((sum, [, minutes]) => sum + minutes, 0);
  return { plan, module: chapter, rows, total, periods: Math.ceil(total / PLAN_MINUTES.period), chapter: moduleVisuals[chapter.id].chapter };
});

function Sheet({ title, chapter, children }: { title: string; chapter: string; children: React.ReactNode }) {
  return <article className="print-sheet"><header><span>Wordplay · Hands-on AI literacy</span><span>{chapter}</span></header><h1>{title}</h1>{children}<footer>From the Wordplay teacher toolkit. Free to copy for classroom use.</footer></article>;
}

export function ChapterPlans() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = plans[active];

  function onKey(event: KeyboardEvent) {
    const move = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "Home" ? -active : event.key === "End" ? plans.length - 1 - active : 0;
    if (!move) return;
    event.preventDefault();
    const next = (active + move + plans.length) % plans.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return <div className="plans">
    <div className="plan-tabs" role="tablist" aria-label="Chapter plans" onKeyDown={onKey}>
      {plans.map((item, index) => <button key={item.module.id} ref={(element) => { tabs.current[index] = element; }} type="button" role="tab" id={`plan-tab-${item.module.id}`} aria-selected={index === active} aria-controls={`plan-panel-${item.module.id}`} tabIndex={index === active ? 0 : -1} onClick={() => setActive(index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.chapter}</button>)}
    </div>
    <section className="plan-panel" role="tabpanel" id={`plan-panel-${current.module.id}`} aria-labelledby={`plan-tab-${current.module.id}`}>
      <div className="plan-head">
        <div><p className="plan-kicker">Chapter {String(active + 1).padStart(2, "0")} · {current.total} minutes · {current.periods === 1 ? "one class period" : `${current.periods} class periods`}</p><h3>{current.module.title}</h3><p>{current.module.tagline}</p></div>
        <div className="plan-actions">
          <button type="button" className="button-primary" onClick={() => printSection(`plan-${current.module.id}`)}>Print plan</button>
          <button type="button" className="plan-print" onClick={() => printSection(`worksheet-${current.module.id}`)}>Print worksheet</button>
          <button type="button" className="plan-print" onClick={() => printSection(`answers-${current.module.id}`)}>Print answer guide</button>
        </div>
      </div>
      <ul className="plan-ideas" aria-label="AI4K12 Big Ideas">{current.plan.bigIdeas.map((id) => <li key={id}><strong>Big Idea {id}</strong> {bigIdeas.find((idea) => idea.id === id)!.name}</li>)}</ul>
      <div className="plan-grid">
        <div>
          <h4>Students will be able to</h4>
          <ul className="plan-list">{current.module.lessons.map((lesson) => <li key={lesson.id}>{lesson.keyTakeaways[0]}</li>)}</ul>
          <h4>Warm-up</h4>
          <p>{current.plan.warmup}</p>
          <h4>Discussion questions</h4>
          <ol className="plan-list">{current.plan.discussion.map((item) => <li key={item}>{item}</li>)}</ol>
        </div>
        <div>
          <h4>Timing</h4>
          <table className="plan-timing"><tbody>{current.rows.map(([label, minutes]) => <tr key={label}><th scope="row">{label}</th><td>{minutes} min</td></tr>)}<tr><th scope="row">Total</th><td>{current.total} min</td></tr></tbody></table>
          {current.periods > 1 && <p className="plan-note">Plan for {current.periods} class periods: lessons in the first, then the activity, discussion and quiz.</p>}
          <h4>Activity tips</h4>
          <ul className="plan-list">{current.plan.activityTips.map((item) => <li key={item}>{item}</li>)}</ul>
          <h4>Check for understanding</h4>
          <p>The chapter quiz has {current.module.quiz.length} questions with an explanation after each answer. A score of 70% or more completes the chapter.</p>
          <h4>Extension</h4>
          <p>{current.plan.extension}</p>
          <Link href={`/modules/${current.module.slug}`} className="text-link">Open the chapter <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
    <div className="print-only" aria-hidden="true">
      {plans.map(({ plan, module, rows, total, chapter }) => <div key={module.id}>
        <div data-print-id={`plan-${module.id}`}><Sheet title={`Lesson plan: ${module.title}`} chapter={chapter}>
          <p><strong>Big Ideas:</strong> {plan.bigIdeas.map((id) => `${id}. ${bigIdeas.find((idea) => idea.id === id)!.name}`).join(" · ")}</p>
          <h2>Students will be able to</h2><ul>{module.lessons.map((lesson) => <li key={lesson.id}>{lesson.keyTakeaways[0]}</li>)}</ul>
          <h2>Timing ({total} minutes)</h2><ul>{rows.map(([label, minutes]) => <li key={label}>{label}: {minutes} min</li>)}</ul>
          <h2>Warm-up</h2><p>{plan.warmup}</p>
          <h2>Discussion</h2><ol>{plan.discussion.map((item) => <li key={item}>{item}</li>)}</ol>
          <h2>Activity tips</h2><ul>{plan.activityTips.map((item) => <li key={item}>{item}</li>)}</ul>
          <h2>Extension</h2><p>{plan.extension}</p>
        </Sheet></div>
        <div data-print-id={`worksheet-${module.id}`}><Sheet title={`Worksheet: ${module.title}`} chapter={chapter}>
          <p className="sheet-name">Name ______________________________ Date ______________</p>
          <ol className="sheet-questions">{plan.worksheet.map((item) => <li key={item.question}><p>{item.question}</p><p className="sheet-lesson">Lesson: {module.lessons.find((lesson) => lesson.id === item.lessonId)!.title}</p><div className="sheet-lines" /></li>)}</ol>
        </Sheet></div>
        <div data-print-id={`answers-${module.id}`}><Sheet title={`Answer guide: ${module.title}`} chapter={chapter}>
          <ol className="sheet-questions">{plan.worksheet.map((item) => <li key={item.question}><p><strong>{item.question}</strong></p><p>{item.answer}</p></li>)}</ol>
        </Sheet></div>
      </div>)}
    </div>
  </div>;
}
