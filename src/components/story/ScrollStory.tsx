"use client";

import { useEffect, useRef, useState } from "react";
import type { Application } from "@splinetool/runtime";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";
import { ContourLandscape } from "./ContourLandscape";
import { SplineScene } from "./SplineScene";

const SCENE = process.env.NEXT_PUBLIC_SPLINE_SCENE;

const chapters = [
  {
    eyebrow: "01 Understand",
    title: "See how the machine actually thinks.",
    body: "Data in, patterns out. Learn what a model is, what it isn't, and why it sounds so sure.",
  },
  {
    eyebrow: "02 Practice",
    title: "Ask better, get better.",
    body: "Prompting, checking, citing. Hands-on tools you'll actually use for homework and beyond.",
  },
  {
    eyebrow: "03 Decide",
    title: "Use it. Don't let it use you.",
    body: "Bias, privacy, honesty. Make calls you can defend to your teacher and yourself.",
  },
] as const;

function Chapter({
  chapter,
  className,
}: {
  chapter: (typeof chapters)[number];
  className?: string;
}) {
  return (
    <div className={cn("chapter", className)}>
      <div className="shell w-full pb-20 sm:pb-0">
        <p className="eyebrow text-paper/60">{chapter.eyebrow}</p>
        <h2 className="mt-5 max-w-4xl font-display text-[clamp(2.5rem,7vw,7rem)] leading-[.95]">
          {chapter.title}
        </h2>
        <p className="mt-7 max-w-md text-paper/70">{chapter.body}</p>
      </div>
    </div>
  );
}

export function ScrollStory() {
  const storyRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const splineStartRef = useRef({ z: 0, x: 0 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || reduced || !storyRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: storyRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      const chapterNodes = gsap.utils.toArray<HTMLElement>(".chapter");

      chapterNodes.forEach((chapter, index) => {
        const start = index / 3;
        timeline.fromTo(
          chapter,
          { autoAlpha: index === 0 ? 1 : 0, y: index === 0 ? 0 : 40 },
          { autoAlpha: 1, y: 0, duration: 0.22 },
          start
        );
        if (index < chapterNodes.length - 1) {
          timeline.to(
            chapter,
            { autoAlpha: 0, y: -40, duration: 0.2 },
            (index + 1) / 3 - 0.06
          );
        }
      });

      if (visualRef.current) {
        timeline.fromTo(
          visualRef.current,
          { scale: 1.1 },
          { scale: 1, duration: 1 },
          0
        );
      }

      if (SCENE) {
        timeline.eventCallback("onUpdate", () => {
          const app = appRef.current;
          if (!app) return;
          const progress = timeline.progress();
          const camera = app.findObjectByName("Camera");
          if (camera) {
            camera.position.z = splineStartRef.current.z - progress * 600;
            camera.rotation.x = splineStartRef.current.x - progress * 0.25;
          }
          const needle = app.findObjectByName("Needle");
          if (needle) needle.rotation.y = progress * Math.PI * 2;
        });
      } else {
        const stage = visualRef.current?.querySelector(".contour-stage");
        if (stage) {
          timeline.fromTo(
            stage,
            { rotateX: 55, scale: 1.15, yPercent: 12 },
            { rotateX: 30, scale: 1, yPercent: -8, duration: 1 },
            0
          );
          gsap
            .utils
            .toArray<SVGPathElement>("path[data-depth]")
            .forEach((path) => {
              const depth = Number(path.dataset.depth ?? 0);
              timeline.to(path, { y: -(1 - depth) * 60, duration: 1 }, 0);
            });
          timeline.to(
            ".contour-needle, .contour-needle-glow",
            { x: 160, duration: 1 },
            0
          );
        }
      }
    }, storyRef);

    return () => context.revert();
  }, [reduced]);

  const handleSplineLoad = (app: Application) => {
    appRef.current = app;
    const camera = app.findObjectByName("Camera");
    if (camera) {
      splineStartRef.current = {
        z: camera.position.z,
        x: camera.rotation.x,
      };
    }
    ScrollTrigger.refresh();
  };

  const visual = SCENE ? (
    <SplineScene scene={SCENE} onLoad={handleSplineLoad} className="h-full w-full" />
  ) : (
    <ContourLandscape />
  );

  if (reduced) {
    return (
      <section className="relative bg-dark text-paper">
        <div className="relative">
          <div className="relative h-[60vh] overflow-hidden">{visual}</div>
          <div className="relative">
            {chapters.map((chapter) => (
              <Chapter key={chapter.eyebrow} chapter={chapter} className="relative py-24" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-dark text-paper">
      <div ref={storyRef} className="story h-[400vh]">
        <div className="story-stage sticky top-0 h-screen overflow-hidden">
          <div ref={visualRef} className="story-visual absolute inset-0">
            {visual}
          </div>
          {chapters.map((chapter) => (
            <Chapter
              key={chapter.eyebrow}
              chapter={chapter}
              className="absolute inset-0 flex items-end opacity-100 sm:items-center"
            />
          ))}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-dark via-transparent" />
        </div>
      </div>
    </section>
  );
}
