"use client";
import Link from "next/link";
import { modules } from "@/content";
import { glossary } from "@/content/glossary";
import { useProgress } from "@/state/ProgressProvider";
import { levelFor, nextLevel, progressToNext } from "@/engine/levels";
import { evaluateBadges } from "@/engine/badges";
import { BADGES } from "@/engine/badges";
import { exportProgress } from "@/engine/storage";
import { ProgressBar } from "@/components/ProgressBar";

function modulePercent(moduleId: string, lessons: number, state: ReturnType<typeof useProgress>["state"]) {
  const done = state.completedLessons.filter((key) => key.startsWith(`${moduleId}/`)).length;
  return Math.round(((done + (state.completedActivities.includes(moduleId) ? 1 : 0) + (state.quizBest[moduleId] ?? 0) / 100) / (lessons + 2)) * 100);
}

const pad = (n: number) => String(n).padStart(2, "0");

const marqueeItems = ["learn how AI works", "practice smart prompts", "make responsible choices", "design a project you can defend", "no accounts", "no tracking"];

function Landing() {
  const lessonCount = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  return (
    <>
      <section className="relative overflow-hidden border-b border-ink">
        <div className="grid-lines absolute inset-0" aria-hidden="true" />
        <span className="ghost right-[-6vw] top-[8vw] text-[36vw] opacity-30" aria-hidden="true">AI</span>
        <div className="shell relative py-16 sm:py-24 lg:py-32">
          <p className="eyebrow animate-rise">AI Compass / a field guide for grades 9–12</p>
          <h1 className="display-xl mt-8 max-w-[14ch] animate-rise [animation-delay:80ms]">
            Find your<br />way through<br /><span className="text-signal">AI</span>.
          </h1>
          <div className="mt-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <p className="prose-body max-w-xl animate-rise [animation-delay:160ms]">Learn how AI actually works, practice prompts that get results, make responsible choices, and design a project you can defend in front of anyone.</p>
            <Link href="/modules" className="button-primary animate-rise px-8 py-4 text-sm [animation-delay:240ms]">Start learning <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <div className="terminal overflow-hidden border-b border-signal/40 py-3" aria-hidden="true">
        <div className="marquee-track mono-label gap-10">
          {[...marqueeItems, ...marqueeItems].map((item, i) => <span key={i}>{item} <span className="ml-10">://</span></span>)}
        </div>
      </div>

      <section className="shell grid gap-px border-x border-b border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
        {[
          [modules.length, "modules"],
          [lessonCount, "lessons"],
          [glossary.length, "glossary terms"],
          [BADGES.length, "badges to earn"]
        ].map(([value, label]) => (
          <div key={label} className="bg-paper p-6 sm:p-8">
            <p className="display-md tabular-nums">{pad(Number(value))}</p>
            <p className="index mt-3">{label}</p>
          </div>
        ))}
      </section>

      <section className="shell py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.4fr_0.6fr]">
          <div>
            <p className="eyebrow">The playbook</p>
            <h2 className="display-lg mt-4">Five<br />moves.</h2>
          </div>
          <ol className="divide-y divide-ink border-y border-ink">
            {modules.map((module, i) => (
              <li key={module.id}>
                <Link href={`/modules/${module.slug}`} className="group flex flex-col gap-3 py-7 transition-colors hover:text-signal focus-visible:outline-none focus-visible:text-signal sm:flex-row sm:items-baseline sm:gap-8">
                  <span className="index w-12 shrink-0">{pad(i + 1)}</span>
                  <span className="display-sm flex-1">{module.title}</span>
                  <span className="max-w-xs text-sm text-mute group-hover:text-ink">{module.tagline}</span>
                  <span aria-hidden="true" className="hidden text-2xl transition-transform group-hover:translate-x-2 sm:block">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="terminal border-y border-signal/40">
        <div className="shell scanlines grid gap-10 py-20 md:grid-cols-2 sm:py-28">
          <div>
            <p className="mono-label">:// your local learning lab</p>
            <h2 className="display-lg mt-6 text-paper">No accounts.<br />No tracking.<br />Just you.</h2>
          </div>
          <div className="flex flex-col justify-end gap-6 font-display text-paper">
            <p className="text-lg leading-relaxed">Progress is saved in your browser and can be exported as JSON whenever you want. Take it to another device, hand it to a teacher, or wipe it clean.</p>
            <Link href="/about" className="button-secondary w-max border-signal text-signal hover:bg-signal hover:text-ink">Teacher guide <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Dashboard() {
  const { state, reset, importJson } = useProgress();
  const level = levelFor(state.xp); const next = nextLevel(state.xp);
  function upload(event: React.ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => importJson(String(reader.result)); reader.readAsText(file); }
  function download() { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([exportProgress(state)], { type: "application/json" })); link.download = "ai-compass-progress.json"; link.click(); }
  if (!state.startedAt) return <Landing />;
  const badges = evaluateBadges(state, modules);
  const overall = Math.round(modules.reduce((sum, module) => sum + modulePercent(module.id, module.lessons.length, state), 0) / modules.length);
  return (
    <div className="shell py-12 sm:py-16">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><p className="eyebrow">Welcome back / status report</p><h1 className="display-lg mt-4">Your<br />compass.</h1></div>
        <div className="flex flex-wrap gap-2">
          <button className="button-secondary" onClick={download}>Export</button>
          <label className="button-secondary cursor-pointer">Import<input type="file" accept="application/json" className="sr-only" onChange={upload} /></label>
          <button className="button-secondary" onClick={() => { if (window.confirm("Reset all local progress?")) reset(); }}>Reset</button>
        </div>
      </div>

      <div className="mt-12 grid gap-px border border-ink bg-ink lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="bg-paper p-6 sm:p-8">
          <p className="index">level / {level.name}</p>
          <p className="display-lg mt-3 tabular-nums">{state.xp} XP</p>
          <div className="mt-8">{next ? <ProgressBar value={progressToNext(state.xp) * 100} label={`${next.minXp - state.xp} XP to ${next.name}`} /> : <ProgressBar value={100} label="Maximum level reached" />}</div>
        </div>
        <div className="bg-paper p-6 sm:p-8">
          <p className="index">overall progress</p>
          <p className="display-lg mt-3 tabular-nums">{overall}<span className="text-signal">%</span></p>
          <p className="mt-4 text-sm text-mute">One step at a time.</p>
        </div>
        <div className="bg-ink p-6 text-paper sm:p-8">
          <p className="index text-paper/70">streak</p>
          <p className="display-lg mt-3 tabular-nums">{pad(state.streak.count)}</p>
          <p className="mt-4 text-sm text-paper/70">{state.streak.count === 1 ? "day" : "days"} in a row</p>
        </div>
      </div>

      <div className="mt-20 flex items-end justify-between gap-4"><h2 className="display-md">Your modules</h2><span className="index">{pad(modules.length)} total</span></div>
      <div className="mt-6 grid gap-px border border-ink bg-ink md:grid-cols-2">
        {modules.map((module, i) => {
          const percent = modulePercent(module.id, module.lessons.length, state);
          const nextLesson = module.lessons.find((lesson) => !state.completedLessons.includes(`${module.id}/${lesson.id}`));
          return (
            <div className="card flex flex-col border-0 p-6 sm:p-8" key={module.id}>
              <div className="flex items-start justify-between"><span className="index">{pad(i + 1)} <span aria-hidden="true" className="ml-2">{module.icon}</span></span><span className="display-sm tabular-nums text-mute">{percent}%</span></div>
              <h3 className="display-sm mt-8">{module.title}</h3>
              <p className="mt-3 text-sm text-mute">{module.tagline}</p>
              <div className="mt-8 flex-1"><ProgressBar value={percent} label="Module progress" /></div>
              <Link href={`/modules/${module.slug}${nextLesson ? `/lessons/${nextLesson.id}` : ""}`} className="button-secondary mt-8 w-full">{nextLesson ? "Continue" : "Review module"} <span aria-hidden="true">→</span></Link>
            </div>
          );
        })}
      </div>

      <div className="mt-20 grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="display-md">Badge shelf</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {badges.length === 0 && <p className="text-sm text-mute">No badges yet. Complete a lesson to earn your first.</p>}
            {badges.slice(0, 8).map((id) => { const badge = BADGES.find((item) => item.id === id); return <span key={id} title={badge?.description} className="mono-label border border-ink bg-ink px-3 py-2 text-paper">{badge?.icon} {badge?.name}</span>; })}
          </div>
          {badges.length > 0 && <Link href="/badges" className="nav-link mt-6 inline-block">All badges <span aria-hidden="true">→</span></Link>}
        </div>
        <div className="terminal frame p-6 sm:p-8">
          <p className="mono-label">:// next step</p>
          <p className="mt-4 font-display text-lg text-paper">Read, practice, and quiz your way through the compass.</p>
          <Link href="/modules" className="button-secondary mt-6 border-signal text-signal hover:bg-signal hover:text-ink">Browse modules</Link>
        </div>
      </div>
    </div>
  );
}
