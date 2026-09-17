"use client";

import { levelFor } from "@/engine/levels";
import { useProgress } from "@/state/ProgressProvider";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Hero, LearningPath } from "@/components/Hero";
import { Onboarding } from "@/components/Onboarding";
import { ScrollStory } from "@/components/story/ScrollStory";

export function Landing() {
  const { state, hydrated } = useProgress();
  const level = levelFor(state.xp);

  return (
    <>
      <ScrollStory />
      <Hero />
      <LearningPath />
      <section className="shell py-24 sm:py-32">
        {!hydrated ? (
          <div className="mx-auto max-w-2xl animate-pulse border border-line bg-line/30 p-10">
            <div className="h-6 w-2/3 bg-line/50" />
            <div className="mt-6 h-24 bg-line/40" />
          </div>
        ) : state.onboarding.done ? (
          <div className="border border-ink bg-ink p-8 text-paper sm:p-12">
            <p className="eyebrow text-paper/60">Your next bearing</p>
            <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-5xl italic sm:text-7xl">Keep going.</h2>
                <p className="mt-4 font-mono text-xs uppercase tracking-[.16em] text-paper/60">
                  Level {level.name} · {state.xp} XP
                </p>
              </div>
              <MagneticButton href="/dashboard">Continue → your dashboard</MagneticButton>
            </div>
          </div>
        ) : (
          <Onboarding />
        )}
      </section>
    </>
  );
}
