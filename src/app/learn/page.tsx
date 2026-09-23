"use client";

import Link from "next/link";
import { KineticText } from "@/components/Kinetic";
import { useState } from "react";
import { modules } from "@/content";
import { BADGES, evaluateBadges } from "@/engine/badges";
import { chapterProgress, chapterSteps, overallProgress, type ChapterStep } from "@/engine/chapters";
import { levelFor, nextLevel } from "@/engine/levels";
import { exportProgress } from "@/engine/storage";
import { nextLearningTask, useProgress } from "@/state/ProgressProvider";
import "./learn.css";

const tones = ["rose", "citron", "ink"] as const;

export default function LearningPage() {
  const { state, hydrated, reset, importJson, storageError, importFeedback } = useProgress();
  const [fileError, setFileError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [focus, setFocus] = useState<ChapterStep | null>(null);
  const level = levelFor(state.xp);
  const next = nextLevel(state.xp);
  const task = nextLearningTask(state);
  const overall = hydrated ? overallProgress(state, modules) : 0;
  const earned = hydrated ? evaluateBadges(state, modules) : [];
  const chapters = modules.map((module) => ({ module, steps: chapterSteps(state, module), progress: chapterProgress(state, module) }));
  const stepsDone = chapters.reduce((total, chapter) => total + chapter.steps.filter((step) => step.done).length, 0);
  const stepsTotal = chapters.reduce((total, chapter) => total + chapter.steps.length, 0);
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError("");
    try { importJson(await file.text()); }
    catch { setFileError("That file could not be read. Your current progress is unchanged."); }
    event.target.value = "";
  }
  function download() {
    const url = URL.createObjectURL(new Blob([exportProgress(state)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "wordplay-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  const hover = (step: ChapterStep) => ({ onMouseEnter: () => setFocus(step), onMouseLeave: () => setFocus(null), onFocus: () => setFocus(step), onBlur: () => setFocus(null) });
  return <div className="learn"><section className="learn-hero" aria-labelledby="learn-title"><div className="shell"><div className="learn-hero-grid"><div><p className="page-hero-label">My learning</p><h1 id="learn-title"><KineticText text="Your next good question." /></h1>{hydrated ? <><p className="learn-next">{state.startedAt ? <>Up next: <strong>{task.label}</strong></> : "Start with AI Foundations. No account needed: your learning progress stays on this device."}</p><Link href={task.href} className="button-primary">{state.startedAt ? "Continue learning" : "Explore lessons"} <span aria-hidden="true">↗</span></Link></> : <p className="learn-next" role="status">Checking this device’s progress…</p>}</div><figure className="question-meter" data-ready={hydrated} style={{ "--fill": overall } as React.CSSProperties}><span className="meter-glyph" aria-hidden="true">?</span><span className="meter-glyph meter-fill" aria-hidden="true">?</span><figcaption><strong>{overall}%</strong> of the course done</figcaption></figure></div>{hydrated && <dl className="learn-figures"><div><dt>Experience</dt><dd><strong>{state.xp} XP</strong><span>{level.name}</span></dd></div><div><dt>Next level</dt><dd><strong>{next ? `${next.minXp - state.xp} XP` : "Reached"}</strong><span>{next ? `to ${next.name}` : "Top level"}</span></dd></div><div><dt>Streak</dt><dd><strong>{state.streak.count} {state.streak.count === 1 ? "day" : "days"}</strong><span>{state.streak.count ? "Learn again tomorrow for +5 XP" : "Start today, then come back tomorrow"}</span></dd></div><div><dt>Badges</dt><dd><strong>{earned.length} of {BADGES.length}</strong><span><Link href="/badges">See the shelf</Link></span></dd></div></dl>}</div></section>{hydrated && <><section className="shell chapter-map" aria-labelledby="map-title"><div className="map-head"><h2 id="map-title">Your chapters</h2><p>Each square is one step: the lessons, then practice, then the quiz. Filled squares are done.</p></div><ol className="map-rows">{chapters.map(({ module, steps, progress }, index) => <li key={module.id} className="map-row" data-reveal={index}><div className="map-label"><span className="map-number">{String(index + 1).padStart(2, "0")}</span><div><h3><Link href={`/modules/${module.slug}`}>{module.title}</Link></h3><p>{steps.filter((step) => step.done).length} of {steps.length} steps · {progress.complete ? "Complete" : progress.started ? "In progress" : "Not started"}</p></div></div><ol className="map-steps" aria-label={`${module.title} steps`}>{steps.map((step, position) => <li key={step.key}><Link href={step.href} className="map-step" data-kind={step.kind} data-done={step.done} data-next={step.href === task.href} {...hover(step)}><span aria-hidden="true">{step.kind === "lesson" ? position + 1 : step.kind === "practice" ? "[ ]" : "?"}</span><span className="sr-only">{step.kind === "lesson" ? `Lesson ${position + 1}: ` : ""}{step.title}, {step.done ? "done" : step.href === task.href ? "up next" : "not done"}</span></Link></li>)}</ol><Link href={progress.next?.href ?? `/modules/${module.slug}`} className="text-link map-go">{progress.complete ? "Review" : progress.started ? "Continue" : "Start"}<span className="sr-only"> {module.title}</span> <span aria-hidden="true">↗</span></Link></li>)}</ol><p className="map-caption" aria-hidden="true">{focus ? <><strong>{focus.title}</strong> {focus.detail}. {focus.done ? "Done." : focus.href === task.href ? "Up next." : "Not done yet."}</> : `${stepsDone} of ${stepsTotal} steps done across the course.`}</p></section><section className="shell learn-badges" aria-labelledby="learn-badges-title"><div className="learn-section-head"><h2 id="learn-badges-title">Badge shelf</h2><Link href="/badges" className="text-link">All badges <span aria-hidden="true">↗</span></Link></div><ul className="mini-badges">{BADGES.map((badge, index) => { const has = earned.includes(badge.id); return <li key={badge.id} data-earned={has} data-tone={tones[index % tones.length]} data-reveal={index % 7}><span className="mini-mark" aria-hidden="true">{badge.mark}</span><span className="mini-name">{badge.name}<span className="sr-only">{has ? ", earned" : ", locked"}</span></span></li>; })}</ul></section><section className="shell learn-file" aria-labelledby="progress-controls-title"><div className="file-card" data-reveal=""><p className="file-tab" aria-hidden="true">wordplay-progress.json</p><h2 id="progress-controls-title">Your progress, in your hands.</h2><p className="small-note">Export a copy to keep or import it on another device. Prompt drafts are local-only and are not included in progress exports.</p><dl className="file-contents"><div><dt>Lessons read</dt><dd>{state.completedLessons.length}</dd></div><div><dt>Activities done</dt><dd>{state.completedActivities.length}</dd></div><div><dt>Quiz scores</dt><dd>{Object.keys(state.quizBest).length}</dd></div><div><dt>Started</dt><dd>{state.startedAt ? new Date(state.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Not yet"}</dd></div></dl><div className="progress-controls"><button className="button-secondary" onClick={download}>Export progress</button><label className="button-secondary">Import progress<input type="file" accept="application/json" className="sr-only" onChange={upload} /></label><button className="button-secondary" onClick={() => setConfirmReset(true)}>Reset progress</button></div>{confirmReset && <div className="reset-confirm"><p>Reset all local progress? This cannot be undone. Your prompt draft will stay.</p><div className="progress-controls"><button className="button-secondary" onClick={() => setConfirmReset(false)}>Cancel</button><button className="button-primary" onClick={() => { reset(); setConfirmReset(false); }}>Yes, reset progress</button></div></div>}<p className="import-feedback" role="status">{fileError || importFeedback}</p>{storageError && <p className="storage-warning" role="status">{storageError}</p>}</div></section></>}</div>;
}
