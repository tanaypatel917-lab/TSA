"use client";

import Link from "next/link";
import { modules } from "@/content";
import { BADGES, evaluateBadges } from "@/engine/badges";
import { levelFor, nextLevel, progressToNext } from "@/engine/levels";
import { exportProgress } from "@/engine/storage";
import { useProgress } from "@/state/ProgressProvider";
import { ModuleList } from "@/components/ModuleList";
import { ProgressBar } from "@/components/ProgressBar";
import { StreakCard } from "@/components/StreakCard";
import { DailyChallenge } from "@/components/DailyChallenge";
import { Onboarding } from "@/components/Onboarding";

const GOAL_LABELS = { 1: "Casual", 2: "Regular", 3: "Serious" } as const;

function modulePercent(moduleId: string, lessons: number, state: ReturnType<typeof useProgress>["state"]) {
  const done = state.completedLessons.filter((key) => key.startsWith(`${moduleId}/`)).length;
  return Math.round(((done + (state.completedActivities.includes(moduleId) ? 1 : 0) + (state.quizBest[moduleId] ?? 0) / 100) / (lessons + 2)) * 100);
}

export default function Dashboard() {
  const { state, reset, importJson, hydrated } = useProgress();
  const level = levelFor(state.xp); const next = nextLevel(state.xp);
  function upload(event: React.ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => importJson(String(reader.result)); reader.readAsText(file); }
  function download() { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([exportProgress(state)], { type: "application/json" })); link.download = "ai-compass-progress.json"; link.click(); }
  if (!hydrated) return <div className="shell py-32"><div className="h-40 animate-pulse bg-line/40" /></div>;
  if (!state.onboarding.done) return <Onboarding />;
  const badges = evaluateBadges(state, modules);
  const progress = Object.fromEntries(modules.map((module) => [module.id, modulePercent(module.id, module.lessons.length, state)]));
  const overall = Math.round(Object.values(progress).reduce((a, b) => a + b, 0) / modules.length);
  return <div className="shell py-32"><div className="grid gap-10 lg:grid-cols-12"><div className="lg:col-span-8"><p className="eyebrow"><span className="mr-3 text-accent">00</span> Your dashboard <span className="ml-3 rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/60">Daily goal: {GOAL_LABELS[state.onboarding.dailyGoal]}</span></p><h1 className="mt-6 font-display text-[clamp(3.5rem,8vw,7rem)] leading-[.88]">Keep finding<br /><em>your way.</em></h1></div><p className="self-end text-lg leading-relaxed text-ink/65 lg:col-start-9 lg:col-span-4">Small steps become a point of view. Return when you are ready for the next question.</p></div><section className="mt-20 grid gap-px bg-line sm:grid-cols-3"><div className="bg-paper p-7"><p className="eyebrow">Current level</p><p className="mt-6 font-display text-5xl italic">{level.name}</p><p className="mt-3 font-mono text-4xl">{state.xp} <span className="text-sm text-ink/50">XP</span></p></div><div className="bg-paper p-7"><p className="eyebrow">Overall progress</p><p className="mt-6 font-mono text-6xl">{overall}<span className="text-2xl">%</span></p><ProgressBar value={progressToNext(state.xp) * 100} label={next ? `${next.minXp - state.xp} XP to ${next.name}` : "Maximum level"} /></div><StreakCard /></section><section className="mt-16"><DailyChallenge /></section><div className="mt-16 flex flex-wrap gap-5 border-b border-line pb-6"><button className="btn-ghost" onClick={download}>Export progress ↗</button><label className="btn-ghost cursor-pointer">Import progress ↗<input type="file" accept="application/json" className="sr-only" onChange={upload} /></label><button className="btn-ghost" onClick={() => { if (window.confirm("Reset all local progress?")) reset(); }}>Reset ↗</button></div><section className="mt-24"><div className="mb-10 flex items-end justify-between"><div><p className="eyebrow"><span className="mr-3 text-accent">01</span> Continue</p><h2 className="mt-5 font-display text-5xl italic">Your modules</h2></div><Link href="/modules" className="btn-ghost">All modules ↗</Link></div><ModuleList modules={modules} progress={progress} compact /></section><section className="mt-24"><p className="eyebrow"><span className="mr-3 text-accent">02</span> Collected signals</p><h2 className="mt-5 font-display text-5xl italic">Badge shelf</h2><div className="mt-8 flex flex-wrap gap-3">{BADGES.map((badge) => <span key={badge.id} className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-wider ${badges.includes(badge.id) ? "border-lime bg-lime" : "border-line opacity-40"}`}>{badge.icon} {badge.name}</span>)}</div></section></div>;
}
