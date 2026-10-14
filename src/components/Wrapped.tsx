"use client";

import { modules } from "@/content";
import { overallProgress } from "@/engine/chapters";
import { wrapped } from "@/engine/wrapped";
import { useProgress } from "@/state/ProgressProvider";

const tones = ["clay", "sky", "paper"] as const;

export function Wrapped() {
  const { state, hydrated } = useProgress();
  if (!hydrated || !state.startedAt) return null;
  const recap = wrapped(state, modules);
  const cards: { value: string; label: string; note?: string }[] = [
    { value: String(recap.minutes), label: "minutes of reading", note: `${recap.lessons} of ${recap.totalLessons} lessons` },
    { value: recap.quizzes ? `${recap.average}%` : "–", label: "average quiz score", note: recap.best ? `Best: ${recap.best.title}, ${recap.best.score}%` : "No quizzes yet" },
    { value: String(recap.xp), label: "XP earned", note: `Level: ${recap.level}` },
    { value: `${recap.badges}/${recap.totalBadges}`, label: "badges earned" },
    { value: String(recap.words), label: recap.words === 1 ? "word collected on the island" : "words collected on the island" },
    { value: String(recap.streak), label: "day streak", note: recap.days ? `${recap.days} ${recap.days === 1 ? "day" : "days"} since you started` : undefined }
  ];
  return <section className="shell learn-wrapped" aria-labelledby="wrapped-title">
    <p className="page-hero-label">{recap.complete ? "Course complete" : "So far"}</p>
    <h2 id="wrapped-title">Your Wordplay, wrapped.</h2>
    <ol className="wrapped-cards">
      <li className="wrapped-card wrapped-persona" data-reveal="0"><span className="wrapped-kicker">You are</span><strong>{recap.persona}</strong></li>
      {cards.map((card, index) => <li key={card.label} className="wrapped-card" data-tone={tones[index % tones.length]} data-reveal={(index + 1) % 4}><strong>{card.value}</strong><span>{card.label}</span>{card.note && <small>{card.note}</small>}</li>)}
      <li className="wrapped-card wrapped-cta" data-reveal="3"><span className="wrapped-kicker">Last stop</span><strong>{recap.complete ? "Print your certificate." : `${overallProgress(state, modules)}% of the way to your certificate.`}</strong><a href="#certificate-title" className="text-link">{recap.complete ? "Go to the certificate" : "See what’s left"} <span aria-hidden="true">↓</span></a></li>
    </ol>
  </section>;
}
