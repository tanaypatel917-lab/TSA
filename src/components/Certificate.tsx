"use client";

import { useState } from "react";
import { modules } from "@/content";
import { BADGES, evaluateBadges } from "@/engine/badges";
import { courseComplete, overallProgress } from "@/engine/chapters";
import { levelFor } from "@/engine/levels";
import { useProgress } from "@/state/ProgressProvider";
import { printSection } from "./print";

export function Certificate() {
  const { state, hydrated } = useProgress();
  const [name, setName] = useState("");
  if (!hydrated) return null;
  const complete = courseComplete(state, modules);
  const earned = BADGES.filter((badge) => evaluateBadges(state, modules).includes(badge.id));
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return <section className="shell learn-certificate" aria-labelledby="certificate-title" data-complete={complete}>
    <div className="cert-copy">
      <p className="page-hero-label">Certificate</p>
      <h2 id="certificate-title">{complete ? "You finished Wordplay." : "A certificate waits at the end."}</h2>
      {complete
        ? <>
          <p>Type the name you want on your certificate, then print it. The name isn’t saved anywhere.</p>
          <form className="cert-form" onSubmit={(event) => { event.preventDefault(); printSection("certificate"); }}>
            <label><span>Name for the certificate (not saved)</span><input type="text" value={name} maxLength={60} onChange={(event) => setName(event.target.value)} autoComplete="off" /></label>
            <button type="submit" className="button-primary" disabled={!name.trim()}>Print certificate</button>
          </form>
        </>
        : <p>Finish all five chapters (every lesson, the activity and 70% on each quiz) to unlock a printable certificate. You’re {overallProgress(state, modules)}% of the way there.</p>}
    </div>
    <div className="cert-preview" aria-hidden="true"><span className="cert-mark">?</span><strong>Certificate of completion</strong><span>{complete ? name.trim() || "Your name" : "Locked"}</span></div>
    {complete && <div className="print-only" aria-hidden="true"><div data-print-id="certificate" data-print-kind="certificate">
      <article className="print-certificate">
        <p className="cert-brand">Wordplay.</p>
        <p className="cert-kicker">Certificate of completion</p>
        <p className="cert-name">{name.trim()}</p>
        <p className="cert-line">completed <strong>Wordplay: Hands-on AI literacy</strong> on {date}.</p>
        <ul className="cert-chapters">{modules.map((module) => <li key={module.id}>✓ {module.title}</li>)}</ul>
        <p className="cert-stats">{state.xp} XP · {levelFor(state.xp).name} · {earned.length} of {BADGES.length} badges{earned.length ? `: ${earned.map((badge) => badge.name).join(", ")}` : ""}</p>
        <div className="cert-sign"><span>Teacher signature</span><span>Date</span></div>
      </article>
    </div></div>}
  </section>;
}
