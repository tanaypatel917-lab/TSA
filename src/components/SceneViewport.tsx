"use client";

import { useEffect, useRef, useState } from "react";
import type { Application } from "@splinetool/runtime";
import { hideKit, type SceneAsset } from "@/content/visuals";
import { useMotionPreference } from "./MotionPreferences";

type SceneState = "idle" | "loading" | "ready" | "error";

export function SceneViewport({ asset }: { asset: SceneAsset }) {
  const host = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPreference();
  const [near, setNear] = useState(false);
  const [wide, setWide] = useState(false);
  const [state, setState] = useState<SceneState>("idle");
  const [subject, setSubject] = useState("unknown");
  const [attempt, setAttempt] = useState(0);
  const sceneUrl = asset.url.trim();
  const enabled = !!sceneUrl && !reduced && wide;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const resize = () => setWide(media.matches);
    resize();
    media.addEventListener("change", resize);
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setNear(true); }, { rootMargin: "160px" });
    if (host.current) observer.observe(host.current);
    return () => { media.removeEventListener("change", resize); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!enabled || !near || !canvasHost.current || !host.current) return;
    const container = canvasHost.current;
    const viewport = host.current;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.tabIndex = -1;
    container.appendChild(canvas);
    const controller = new AbortController();
    let app: Application | undefined;
    let active = true;
    let loaded = false;
    let visible = true;
    let timedOut = false;
    setState("loading");
    setSubject("unknown");
    const dispose = () => { try { app?.dispose(); } catch {} };
    const playback = () => {
      if (!active || !loaded || !app) return;
      if (visible && !document.hidden) app.play(); else app.stop();
    };
    const size = () => {
      if (active && loaded) app?.setSize(container.clientWidth, container.clientHeight);
    };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; playback(); });
    intersection.observe(viewport);
    const resize = new ResizeObserver(size);
    resize.observe(container);
    document.addEventListener("visibilitychange", playback);
    const timeout = window.setTimeout(() => {
      if (!active || loaded) return;
      timedOut = true;
      controller.abort();
      dispose();
      setState("error");
    }, 12000);
    async function load() {
      try {
        const { Application } = await import("@splinetool/runtime");
        if (!active || timedOut) return;
        app = new Application(canvas, { renderMode: "auto", renderer: "webgl", htmlContentMode: "none" });
        await app.load(sceneUrl, undefined, { signal: controller.signal });
        if (!active || timedOut) { dispose(); return; }
        loaded = true;
        window.clearTimeout(timeout);
        if (!app.findObjectByName(asset.subject)) {
          dispose();
          setSubject("missing");
          setState("error");
          return;
        }
        hideKit(app);
        setSubject("verified");
        app.setBackgroundColor("transparent");
        size();
        playback();
        setState("ready");
      } catch {
        dispose();
        if (active && !timedOut) setState("error");
      } finally { window.clearTimeout(timeout); }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
      intersection.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", playback);
      dispose();
      canvas.remove();
    };
  }, [sceneUrl, asset.subject, enabled, near, attempt]);

  const displayState = !sceneUrl ? "disabled" : !enabled ? "still" : state;
  return <div ref={host} className="scene-viewport" data-scene-state={displayState} data-scene-subject={subject}><div className="question-glyph" aria-hidden="true"><span>?</span><i /></div><div ref={canvasHost} className="scene-canvas" aria-hidden="true" />{enabled && state === "error" && <div className="scene-recovery"><span>Typography mode. 3D unavailable.</span><button onClick={() => setAttempt((value) => value + 1)}>Retry 3D</button></div>}</div>;
}
