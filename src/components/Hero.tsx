"use client";

import { modules } from "@/content";
import { ModuleList } from "@/components/ModuleList";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/useCountUp";
import { GridPattern } from "@/components/magicui/GridPattern";
import { Marquee } from "@/components/magicui/Marquee";
import { TextReveal } from "@/components/magicui/TextReveal";
import ScrambleHover from "@/components/smoothui/scramble-hover";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <>
      <section className="relative overflow-hidden bg-dark py-24 text-paper sm:py-36">
        <GridPattern className="text-paper/10" />
        <div className="shell relative z-10 grid gap-14 md:grid-cols-3">
          <Reveal>
            <p className="font-mono text-7xl text-paper/50"><CountUp target={1} /></p>
            <h2 className="mt-7 font-display text-5xl italic"><ScrambleHover>Understand</ScrambleHover></h2>
            <p className="mt-5 max-w-xs text-paper/60">Build a clear mental model before you build with AI.</p>
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: .8, delay: .2 }} className="mt-10 h-px origin-left bg-paper/20" />
          </Reveal>
          <Reveal delay={.08}>
            <p className="font-mono text-7xl text-paper/50"><CountUp target={2} /></p>
            <h2 className="mt-7 font-display text-5xl italic"><ScrambleHover>Practice</ScrambleHover></h2>
            <p className="mt-5 max-w-xs text-paper/60">Try prompts, scenarios, and projects where your choices matter.</p>
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: .8, delay: .3 }} className="mt-10 h-px origin-left bg-paper/20" />
          </Reveal>
          <Reveal delay={.16}>
            <p className="font-mono text-7xl text-paper/50"><CountUp target={3} /></p>
            <h2 className="mt-7 font-display text-5xl italic"><ScrambleHover>Decide</ScrambleHover></h2>
            <p className="mt-5 max-w-xs text-paper/60">Use curiosity, evidence, and care to choose your next step.</p>
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: .8, delay: .4 }} className="mt-10 h-px origin-left bg-paper/20" />
          </Reveal>
        </div>
      </section>
      <section className="bg-dark text-paper">
        <TextReveal>AI is not magic. It is math, data, and choices — and the choices are yours to learn.</TextReveal>
      </section>
      <div className="overflow-hidden border-b border-line py-7">
        <Marquee reverse pauseOnHover className="p-0 font-display text-5xl italic text-ink/75 sm:text-7xl [--duration:35s] [--gap:2.5rem]" repeat={4}>
          <span className="text-outline">Foundations</span><span>Tools</span><span className="text-outline">Ethics</span><span>Real world</span><span className="text-outline">Capstone</span>
        </Marquee>
      </div>
    </>
  );
}

export function LearningPath() {
  return <section className="shell py-24 sm:py-36"><div className="mb-12 grid gap-6 lg:grid-cols-12"><div className="lg:col-span-7"><p className="eyebrow"><span className="mr-3 text-accent">01</span> The learning path</p><h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-none">Five directions.<br /><em>One compass.</em></h2></div><p className="self-end text-lg leading-relaxed text-ink/75 lg:col-start-8 lg:col-span-4">Short lessons and hands-on exercises for the questions that matter when everyone is learning what AI can do.</p></div><ModuleList modules={modules} /></section>;
}
