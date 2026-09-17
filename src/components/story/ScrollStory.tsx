"use client";

import { useEffect, useRef, useState } from "react";
import type { Application } from "@splinetool/runtime";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";
import { ContourLandscape } from "./ContourLandscape";
import { SplineScene } from "./SplineScene";

const SCENE =
  process.env.NEXT_PUBLIC_SPLINE_SCENE ||
  "https://prod.spline.design/fmshl7XbfaLR3tSa/scene.splinecode";
const SPLINE_CAMERA_NAMES = ["Camera", "PerspectiveCamera"] as const;
const SPLINE_NEEDLE_NAMES = ["Needle", "Compass needle"] as const;
const SPLINE_CAMERA_DOLLY = 140;
const SPLINE_CAMERA_TILT = 0.08;
const SPLINE_LOAD_TIMEOUT_MS = 12000;
type SplineStatus = "checking" | "ok" | "failed";

const chapters = [
  {
    kind: "intro",
    eyebrow: "AI Compass · 2026–27",
    title: "AI COMPASS",
    body: "Scroll to enter.",
  },
  {
    kind: "chapter",
    eyebrow: "01 Understand",
    title: "See how the machine actually thinks.",
    body: "Data in, patterns out. Learn what a model is, what it isn't, and why it sounds so sure.",
  },
  {
    kind: "chapter",
    eyebrow: "02 Practice",
    title: "Ask better, get better.",
    body: "Prompting, checking, citing. Hands-on tools you'll actually use for homework and beyond.",
  },
  {
    kind: "chapter",
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
        <h2 className={cn(
          "mt-5 max-w-4xl font-display leading-[.95]",
          chapter.kind === "intro"
            ? "text-[clamp(4rem,16vw,15rem)] uppercase leading-[.82] tracking-[-.05em] text-paper"
            : "text-[clamp(2.5rem,7vw,7rem)]"
        )}>
          {chapter.kind === "intro" ? (
            <>
              <span className="block">AI</span>
              <span className="text-outline-paper block">COMPASS</span>
            </>
          ) : chapter.title}
        </h2>
        <p className={cn(
          "mt-7 max-w-md text-paper/70",
          chapter.kind === "intro" && "story-scroll-cue font-mono text-xs uppercase tracking-[.18em]"
        )}>
          {chapter.kind === "intro" && <span className="mr-2 text-accent">↓</span>}
          {chapter.body}
        </p>
      </div>
    </div>
  );
}

function splineCameraTilt(startX: number, progress: number) {
  const landing = Math.min(1, Math.max(0, (progress - 0.85) / 0.15));
  const easedLanding = landing * landing * (3 - 2 * landing);
  return startX - progress * SPLINE_CAMERA_TILT + easedLanding * 0.25;
}

export function ScrollStory() {
  const storyRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const splineStartRef = useRef({ z: 0, x: 0 });
  const [reduced, setReduced] = useState(false);
  const [splineStatus, setSplineStatus] = useState<SplineStatus>(SCENE ? "checking" : "failed");
  const splineLoadedRef = useRef(false);
  const useSpline = splineStatus === "ok";

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.storyActive = "1";
    return () => {
      delete root.dataset.storyActive;
    };
  }, []);

  useEffect(() => {
    if (!SCENE) {
      setSplineStatus("failed");
      return;
    }
    const gpu = (navigator as Navigator & {
      gpu?: { requestAdapter(): Promise<unknown | null> };
    }).gpu;
    if (!gpu) {
      setSplineStatus("failed");
      return;
    }
    let cancelled = false;
    gpu.requestAdapter()
      .then((adapter) => {
        if (!cancelled) setSplineStatus(adapter ? "ok" : "failed");
      })
      .catch(() => {
        if (!cancelled) setSplineStatus("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (splineStatus !== "ok") return;
    const timer = window.setTimeout(() => {
      if (!splineLoadedRef.current) setSplineStatus("failed");
    }, SPLINE_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [splineStatus]);

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
          onToggle: ({ isActive }) => {
            document.documentElement.dataset.storyActive = isActive ? "1" : "0";
          },
        },
      });
      const chapterNodes = gsap.utils.toArray<HTMLElement>(".chapter");

      chapterNodes.forEach((chapter, index) => {
        const start = index === 0 ? 0 : index / 4 - 0.07;
        timeline.fromTo(
          chapter,
          { autoAlpha: index === 0 ? 1 : 0, y: index === 0 ? 0 : 40 },
          { autoAlpha: 1, y: 0, duration: 0.07 },
          start
        );
        if (index < chapterNodes.length - 1) {
          timeline.to(
            chapter,
            { autoAlpha: 0, y: -40, duration: 0.07 },
            (index + 1) / 4 - 0.08
          );
        }
      });
      timeline.to(".story-scroll-cue", { autoAlpha: 0, duration: 0.03 }, 0.05);

      if (visualRef.current) {
        timeline.fromTo(
          visualRef.current,
          { scale: 1.1 },
          { scale: 1, duration: 1 },
          0
        );
        timeline.to(
          visualRef.current,
          { yPercent: -12, opacity: 0.35, duration: 0.12 },
          0.88
        );
      }

      if (useSpline) {
        timeline.eventCallback("onUpdate", () => {
          const app = appRef.current;
          if (!app) return;
          const progress = timeline.progress();
          const camera = SPLINE_CAMERA_NAMES.map((name) =>
            app.findObjectByName(name)
          ).find((object) => object);
          if (camera) {
            camera.position.z =
              splineStartRef.current.z - progress * SPLINE_CAMERA_DOLLY;
            camera.rotation.x =
              splineCameraTilt(splineStartRef.current.x, progress);
          }
          const needle = SPLINE_NEEDLE_NAMES.map((name) =>
            app.findObjectByName(name)
          ).find((object) => object);
          if (needle) needle.rotation.y = progress * Math.PI * 0.65;
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
  }, [reduced, useSpline]);

  const handleSplineLoad = (app: Application) => {
    appRef.current = app;
    splineLoadedRef.current = true;
    const camera = SPLINE_CAMERA_NAMES.map((name) =>
      app.findObjectByName(name)
    ).find((object) => object);
    if (camera) {
      splineStartRef.current = {
        z: camera.position.z,
        x: camera.rotation.x,
      };
    }
    ScrollTrigger.refresh();
  };

  const visual = useSpline ? (
    <SplineScene
      scene={SCENE}
      onLoad={handleSplineLoad}
      className="h-full w-full"
    />
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
      <div ref={storyRef} className="story h-[500vh]">
        <div className="story-stage sticky top-0 box-border h-screen overflow-hidden pt-20">
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
