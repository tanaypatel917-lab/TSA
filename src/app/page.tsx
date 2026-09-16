"use client";
import Link from "next/link";
import { modules } from "@/content";
import { useProgress } from "@/state/ProgressProvider";
import { levelFor, nextLevel, progressToNext } from "@/engine/levels";
import { evaluateBadges } from "@/engine/badges";
import { BADGES } from "@/engine/badges";
import { exportProgress } from "@/engine/storage";
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
  if (!hydrated) return <div className="shell py-12 sm:py-20"><div className="h-40 animate-pulse rounded-3xl bg-slate-100" /></div>;
  if (!state.onboarding.done) return <Onboarding />;
  const badges = evaluateBadges(state, modules);
  const overall = Math.round(modules.reduce((sum, module) => sum + modulePercent(module.id, module.lessons.length, state), 0) / modules.length);
  return <div className="shell py-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Welcome back</p><h1 className="mt-2 text-4xl font-black">Your AI Compass</h1><span className="mt-3 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-800">Daily goal: {GOAL_LABELS[state.onboarding.dailyGoal]}</span></div><div className="flex gap-2"><button className="button-secondary text-sm" onClick={download}>Export</button><label className="button-secondary cursor-pointer text-sm">Import<input type="file" accept="application/json" className="sr-only" onChange={upload} /></label><button className="button-secondary text-sm" onClick={() => { if (window.confirm("Reset all local progress?")) reset(); }}>Reset</button></div></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]"><div className="grid gap-5"><div className="card"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Level {level.name}</p><p className="mt-2 text-3xl font-black">{state.xp} XP</p></div></div><div className="mt-6">{next ? <ProgressBar value={progressToNext(state.xp) * 100} label={`${next.minXp - state.xp} XP to ${next.name}`} /> : <ProgressBar value={100} label="Maximum level reached" />}</div></div><div className="card"><p className="eyebrow">Overall progress</p><p className="mt-2 text-4xl font-black">{overall}%</p><p className="mt-2 text-sm text-slate-600">Keep exploring one step at a time.</p></div></div><StreakCard /></div>
    <div className="mt-5"><DailyChallenge /></div>
    <h2 className="mt-12 text-2xl font-black">Your modules</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{modules.map((module) => { const percent = modulePercent(module.id, module.lessons.length, state); const nextLesson = module.lessons.find((lesson) => !state.completedLessons.includes(`${module.id}/${lesson.id}`)); return <div className="card" key={module.id}><div className="flex items-start justify-between"><span className="text-3xl">{module.icon}</span><span className="text-2xl font-black text-slate-300">{percent}%</span></div><h3 className="mt-4 text-xl font-bold">{module.title}</h3><p className="mt-2 text-sm text-slate-600">{module.tagline}</p><div className="mt-5"><ProgressBar value={percent} label="Module progress" /></div><Link href={`/modules/${module.slug}${nextLesson ? `/lessons/${nextLesson.id}` : ""}`} className="button-secondary mt-5 w-full">{nextLesson ? "Continue" : "Review module"} →</Link></div>; })}</div>
    <div className="mt-12 grid gap-5 md:grid-cols-2"><div><h2 className="text-2xl font-black">Badge shelf</h2><div className="mt-4 flex flex-wrap gap-3">{badges.slice(0, 8).map((id) => { const badge = BADGES.find((item) => item.id === id); return <span key={id} title={badge?.description} className="rounded-2xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900">{badge?.icon} {badge?.name}</span>; })}</div></div><div><h2 className="text-2xl font-black">Next step</h2><p className="mt-4 text-slate-600">Use the Modules page to read, practice, and quiz your way through the compass.</p><Link href="/modules" className="button-primary mt-4">Browse modules</Link></div></div>
  </div>;
}
