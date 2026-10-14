"use client";

import Link from "next/link";
import { modules } from "@/content";
import { chapterSteps, courseComplete, overallProgress } from "@/engine/chapters";
import { useProgress } from "@/state/ProgressProvider";

export function CertificateGoal() {
  const { state, hydrated } = useProgress();
  const percent = hydrated ? overallProgress(state, modules) : 0;
  const complete = hydrated && courseComplete(state, modules);
  return <section className="shell cert-goal" aria-labelledby="cert-goal-title">
    <div className="cert-goal-copy">
      <p className="page-hero-label">The finish line</p>
      <h2 id="cert-goal-title">{complete ? "Your certificate is ready." : "Finish all five. Print your certificate."}</h2>
      <p>Read every lesson, do each chapter’s activity and score at least 70% on each quiz. You type your name when you print, and nothing is sent anywhere.{hydrated && !complete && ` You’re ${percent}% of the way there.`}</p>
      <Link href="/learn/#certificate-title" className="button-primary">{complete ? "Print it" : "See your progress"} <span aria-hidden="true">↗</span></Link>
    </div>
    <div className="cert-goal-card" aria-hidden="true" data-complete={complete}>
      <p className="cert-goal-brand">Wordplay.</p>
      <p className="cert-goal-kicker">Certificate of completion</p>
      <ol>{modules.map((module) => {
        const done = hydrated && chapterSteps(state, module).every((step) => step.done);
        return <li key={module.id} data-done={done}><span>{done ? "✓" : ""}</span>{module.title}</li>;
      })}</ol>
      <div className="cert-goal-bar"><i style={{ width: `${percent}%` }} /></div>
      <p className="cert-goal-percent">{percent}% there</p>
    </div>
  </section>;
}
