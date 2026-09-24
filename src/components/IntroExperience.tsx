"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import type { Application } from "@splinetool/runtime";
import { introActs, introClaim, introDatasets, introPromptParts, introQuestions, type IntroActId, type IntroDataset, type IntroPartId } from "@/content/intro";
import { questionScene } from "@/content/visuals";
import { clearIntroReturn, introReturnPath, markIntroSeen } from "@/engine/intro";
import { autoIntroParts, autoPartCount, clamp, composeIntroPrompt, damp, easeInOutCubic, mixHex, nextIntroHint, resolveTimeline, wallColorIndex, type ActSpan } from "@/engine/introStory";
import { createIntroScene, type IntroScene } from "./intro/IntroScene";
import { useMotionPreference } from "./MotionPreferences";

type SceneState = "idle" | "loading" | "ready" | "error";

const PROMPT_ACT = introActs.findIndex((item) => item.id === "prompts");
const LAST_ACT = introActs.length - 1;
const heroWords = introActs[0].title.split(" ");
const seconds = () => performance.now() / 1000;

export function IntroExperience() {
  const router = useRouter();
  const page = useRef<HTMLElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);
  const marquee = useRef<HTMLDivElement>(null);
  const marqueeTrack = useRef<HTMLDivElement>(null);
  const heroTitle = useRef<HTMLHeadingElement>(null);
  const scene = useRef<IntroScene>();
  const exitTimer = useRef(0);
  const { reduced } = useMotionPreference();
  const [wide, setWide] = useState(false);
  const [state, setState] = useState<SceneState>("idle");
  const [subject, setSubject] = useState("unknown");
  const [objects, setObjects] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [act, setAct] = useState(0);
  const [returnPath, setReturnPath] = useState("/");
  const [dataset, setDataset] = useState<IntroDataset>("varied");
  const [manualParts, setManualParts] = useState<IntroPartId[] | null>(null);
  const [autoCount, setAutoCount] = useState(1);
  const [claimChecked, setClaimChecked] = useState(false);
  const [breaks, setBreaks] = useState(0);
  const [dragged, setDragged] = useState(false);
  const [exit, setExit] = useState<{ x: number; y: number } | null>(null);
  const parts = manualParts ?? autoIntroParts(autoCount);
  const complete = parts.length === introPromptParts.length;
  const sceneUrl = questionScene.url.trim();
  const enabled = !!sceneUrl && !reduced && wide;
  const displayState = !sceneUrl ? "disabled" : !enabled ? "still" : state;
  const live = useRef({ dataset, parts, claimChecked, claimAt: 0, breakAt: 0, celebrateAt: 0, exitAt: 0, interactive: false });
  const pointer = useRef({ x: 0, y: 0, clientX: -9999, clientY: -9999, fine: false });
  const drag = useRef({ active: false, id: -1, lastX: 0, lastTime: 0, velocity: 0, spin: 0 });

  useEffect(() => {
    markIntroSeen();
    setReturnPath(introReturnPath());
    setReady(true);
    document.documentElement.dataset.introPage = "true";
    return () => {
      delete document.documentElement.dataset.introPage;
      window.clearTimeout(exitTimer.current);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const fine = window.matchMedia("(pointer: fine)");
    const update = () => {
      setWide(media.matches);
      pointer.current.fine = fine.matches;
    };
    update();
    media.addEventListener("change", update);
    fine.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      fine.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    Object.assign(live.current, { dataset, parts, claimChecked, interactive: displayState === "ready" });
  });

  useEffect(() => {
    if (complete) live.current.celebrateAt = seconds();
  }, [complete]);

  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      const current = pointer.current;
      current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      current.y = (event.clientY / window.innerHeight - 0.5) * 2;
      current.clientX = event.clientX;
      current.clientY = event.clientY;
      const spin = drag.current;
      if (!spin.active || event.pointerId !== spin.id) return;
      const time = performance.now();
      const delta = (event.clientX - spin.lastX) * 0.011;
      spin.spin += delta;
      spin.velocity = delta / Math.max(0.008, (time - spin.lastTime) / 1000);
      spin.lastX = event.clientX;
      spin.lastTime = time;
    };
    const end = (event: globalThis.PointerEvent) => {
      const spin = drag.current;
      if (!spin.active || event.pointerId !== spin.id) return;
      spin.active = false;
      if (performance.now() - spin.lastTime > 90) spin.velocity = 0;
      if (page.current) delete page.current.dataset.dragging;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !canvasHost.current) return;
    const container = canvasHost.current;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.tabIndex = -1;
    container.appendChild(canvas);
    const controller = new AbortController();
    let instance: Application | undefined;
    let active = true;
    let loaded = false;
    let timedOut = false;
    setState("loading");
    setSubject("unknown");
    const dispose = () => { try { instance?.dispose(); } catch {} };
    const playback = () => {
      if (!active || !loaded || !instance) return;
      if (document.hidden) instance.stop(); else instance.play();
    };
    const size = () => {
      if (!active || !loaded || !instance) return;
      instance.setSize(container.clientWidth, container.clientHeight);
      scene.current?.refresh();
    };
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
        instance = new Application(canvas, { renderMode: "auto", renderer: "webgl", htmlContentMode: "none" });
        await instance.load(sceneUrl, undefined, { signal: controller.signal });
        if (!active || timedOut) { dispose(); return; }
        if (!instance.findObjectByName(questionScene.subject)) {
          dispose();
          setSubject("missing");
          setState("error");
          return;
        }
        const built = await createIntroScene(instance, questionScene.subject);
        if (!active || timedOut) { dispose(); return; }
        loaded = true;
        window.clearTimeout(timeout);
        instance.setBackgroundColor("transparent");
        size();
        playback();
        scene.current = built;
        setObjects(built.objectCount);
        setSubject("verified");
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
      resize.disconnect();
      document.removeEventListener("visibilitychange", playback);
      scene.current = undefined;
      dispose();
      canvas.remove();
    };
  }, [sceneUrl, enabled, attempt]);

  useEffect(() => {
    const root = page.current;
    const stage = backdrop.current;
    if (!root || !stage) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-act-section]"));
    const letters = Array.from(root.querySelectorAll<HTMLElement>(".hero-letter"));
    const weights = letters.map(() => 650);
    const painted = letters.map(() => 650);
    let spans: ActSpan[] = [];
    let offsets: { x: number; y: number }[] = [];
    let loop = 1;
    const measure = () => {
      const scroll = window.scrollY;
      spans = sections.map((section) => ({ top: section.getBoundingClientRect().top + scroll, height: section.offsetHeight }));
      const title = heroTitle.current?.getBoundingClientRect();
      offsets = letters.map((letter) => {
        const box = letter.getBoundingClientRect();
        return { x: box.left - (title?.left ?? 0) + box.width / 2, y: box.top - (title?.top ?? 0) + box.height / 2 };
      });
      loop = Math.max(1, (marqueeTrack.current?.scrollWidth ?? 2) / 2);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);
    const start = performance.now();
    const smoothPointer = { x: 0, y: 0 };
    let frame = 0;
    let previous = start;
    let smoothY = window.scrollY;
    let lastY = smoothY;
    let velocity = 0;
    let color = "";
    let tone = "";
    let shownAct = -1;
    let shownAuto = -1;
    let shownPresence = -1;
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      const title = letters.length && smoothY < window.innerHeight * 1.2 ? heroTitle.current?.getBoundingClientRect() : undefined;
      const dt = clamp((time - previous) / 1000, 0.001, 0.05);
      previous = time;
      const viewport = window.innerHeight;
      smoothY = reduced ? window.scrollY : damp(smoothY, window.scrollY, 9, dt);
      velocity = damp(velocity, (smoothY - lastY) / dt, 5, dt);
      lastY = smoothY;
      const position = resolveTimeline(spans, smoothY, viewport);
      const nearest = Math.round(position.t);
      if (nearest !== shownAct) { shownAct = nearest; setAct(nearest); }
      const from = Math.floor(position.t);
      const next = mixHex(introActs[from].background, introActs[Math.min(LAST_ACT, from + 1)].background, easeInOutCubic(position.t - from));
      if (next !== color) { color = next; stage.style.backgroundColor = next; }
      if (introActs[nearest].tone !== tone) { tone = introActs[nearest].tone; root.dataset.tone = tone; }
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${position.progress.toFixed(4)})`;
      const count = autoPartCount(position.t, position.act === PROMPT_ACT ? position.local : 0, PROMPT_ACT);
      if (count !== shownAuto) { shownAuto = count; setAutoCount(count); }
      const presence = Math.round(clamp(1 - Math.abs(position.t - 1) * 1.4) * 100) / 100;
      if (marquee.current && presence !== shownPresence) { shownPresence = presence; marquee.current.style.opacity = String(presence); }
      if (marqueeTrack.current && presence > 0 && !reduced) {
        const offset = (smoothY * 0.4 + (time / 1000) * 24) % loop;
        marqueeTrack.current.style.transform = `translate3d(${(-offset).toFixed(1)}px, 0, 0) skewX(${clamp(-velocity * 0.0035, -8, 8).toFixed(2)}deg)`;
      }
      if (title) {
        const age = (time - start) / 1000;
        letters.forEach((letter, index) => {
          const wave = reduced ? 1 : clamp((age - 0.25 - index * 0.045) / 0.8);
          let target = 650 - 380 * Math.sin(Math.PI * wave);
          if (!reduced && wave >= 1 && pointer.current.fine) {
            const dx = pointer.current.clientX - (title.left + offsets[index].x);
            const dy = pointer.current.clientY - (title.top + offsets[index].y);
            target = 580 + 120 * Math.exp(-(dx * dx + dy * dy) / 42000);
          }
          weights[index] = wave < 1 ? target : damp(weights[index], target, 10, dt);
          const rounded = Math.round(weights[index]);
          if (rounded !== painted[index]) { painted[index] = rounded; letter.style.fontWeight = String(rounded); }
        });
      }
      const spin = drag.current;
      if (!spin.active) {
        spin.spin += spin.velocity * dt;
        spin.velocity *= Math.exp(-2.4 * dt);
      }
      smoothPointer.x = damp(smoothPointer.x, pointer.current.x, 4, dt);
      smoothPointer.y = damp(smoothPointer.y, pointer.current.y, 4, dt);
      const current = scene.current;
      if (!current) return;
      const input = live.current;
      const width = window.innerWidth;
      const heading = page.current?.querySelector(".finale-copy h2");
      const finaleTop = heading ? heading.getBoundingClientRect().top / viewport : undefined;
      current.update({
        t: position.t, act: position.act, local: position.local, time: time / 1000, dt,
        aspect: width / viewport, compact: width < 1024 || width / viewport < 1.15,
        pointer: smoothPointer, spin: spin.spin, dataset: input.dataset, parts: input.parts,
        claimChecked: input.claimChecked, claimAt: input.claimAt, breakAt: input.breakAt, celebrateAt: input.celebrateAt,
        exit: input.exitAt ? clamp((time / 1000 - input.exitAt) / 0.75) : 0, finaleTop
      });
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduced]);

  function startDrag(event: PointerEvent<HTMLElement>) {
    if (!live.current.interactive || event.pointerType === "touch" || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("a, button, input, label, .act-copy, .intro-index, .intro-topbar")) return;
    event.preventDefault();
    Object.assign(drag.current, { active: true, id: event.pointerId, lastX: event.clientX, lastTime: performance.now(), velocity: 0 });
    event.currentTarget.dataset.dragging = "true";
    setDragged(true);
  }

  function togglePart(id: IntroPartId) {
    setManualParts((current) => {
      const base = current ?? autoIntroParts(autoCount);
      return base.includes(id) ? base.filter((part) => part !== id) : [...base, id];
    });
  }

  function toggleClaim() {
    if (!claimChecked) live.current.claimAt = seconds();
    setClaimChecked((value) => !value);
  }

  function breakIt() {
    live.current.breakAt = seconds();
    setBreaks((value) => value + 1);
  }

  function finish() {
    markIntroSeen();
    clearIntroReturn();
  }

  function leave(event: MouseEvent<HTMLAnchorElement>, href: string) {
    finish();
    if (reduced || exit || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const box = event.currentTarget.getBoundingClientRect();
    live.current.exitAt = seconds();
    setExit({ x: event.clientX || box.left + box.width / 2, y: event.clientY || box.top + box.height / 2 });
    exitTimer.current = window.setTimeout(() => router.push(href), 780);
  }

  function controls(id: IntroActId) {
    switch (id) {
      case "examples":
        return <div className="act-controls act-reveal">
          <div className="act-segmented" role="group" aria-label="Training examples">{introDatasets.map((option) => <button key={option.id} type="button" aria-pressed={dataset === option.id} onClick={() => setDataset(option.id)}>{option.label}</button>)}</div>
          <p className="act-status" role="status">{introDatasets.find((option) => option.id === dataset)?.status}</p>
        </div>;
      case "prompts":
        return <div className="act-controls act-reveal">
          <div className="act-chips" role="group" aria-label="Prompt parts">{introPromptParts.map((part) => <button key={part.id} type="button" aria-pressed={parts.includes(part.id)} onClick={() => togglePart(part.id)}><i style={{ background: part.color }} aria-hidden="true" />{part.label}</button>)}</div>
          <figure className="act-prompt"><figcaption>Your prompt</figcaption><p>{composeIntroPrompt(parts) || "Choose a part to start the prompt."}</p></figure>
          <p className="act-status" role="status"><strong>{parts.length} of {introPromptParts.length} parts.</strong> {nextIntroHint(parts)}</p>
        </div>;
      case "proof":
        return <div className="act-controls act-reveal">
          <figure className="act-claim" data-checked={claimChecked}>
            <figcaption>AI answer</figcaption>
            <blockquote>{introClaim.answer}</blockquote>
            {claimChecked && <ul>{introClaim.checks.map((check) => <li key={check.claim} data-supported={check.supported}><span>{check.claim}</span><strong>{check.verdict}</strong></li>)}</ul>}
          </figure>
          <button type="button" className="button-primary" onClick={toggleClaim}>{claimChecked ? "Show the claim again" : "Check the claim"}</button>
          <p className="act-status" role="status">{claimChecked ? introClaim.status : ""}</p>
        </div>;
      case "practice":
        return <div className="act-controls act-reveal">
          <button type="button" className="button-primary" onClick={breakIt}>Break it <span aria-hidden="true">*</span></button>
          <p className="act-status" role="status">{breaks ? `Rebuilt ${breaks} ${breaks === 1 ? "time" : "times"}. That is the loop: test, notice, improve.` : ""}</p>
        </div>;
      default:
        return null;
    }
  }

  function copy(index: number) {
    const item = introActs[index];
    const titleId = `intro-act-${index}-title`;
    if (item.id === "start") {
      return <div className="act-copy hero-copy">
        <h1 id={titleId} ref={heroTitle} className="hero-title"><span className="sr-only">{item.title}</span><span className="hero-letters" aria-hidden="true">{heroWords.map((word, wordIndex) => <Fragment key={word}>{wordIndex > 0 && " "}<span className="hero-word">{[...word].map((letter, letterIndex) => <span className="hero-letter" key={letterIndex}>{letter}</span>)}</span></Fragment>)}</span></h1>
        <p className="act-reveal">{item.text}</p>
        <a href="#intro-act-1" className="button-primary act-reveal">Start the tour <span aria-hidden="true">↓</span></a>
      </div>;
    }
    if (item.id === "finale") {
      return <div className="act-copy finale-copy">
        <h2 id={titleId} className="act-reveal">{(item.lines ?? [item.title]).map((line, lineIndex) => <Fragment key={line}>{lineIndex > 0 && " "}<span>{line}</span></Fragment>)}</h2>
        <p className="act-reveal">{item.text}</p>
        <div className="finale-actions act-reveal"><Link href={returnPath} className="button-primary" onClick={(event) => leave(event, returnPath)}>Enter Wordplay <span aria-hidden="true">↗</span></Link><Link href="/modules" className="button-secondary" onClick={(event) => leave(event, "/modules")}>Explore lessons</Link></div>
      </div>;
    }
    return <div className="act-copy">
      <h2 id={titleId} className="act-reveal">{item.title}</h2>
      <p className="act-reveal">{item.text}</p>
      {controls(item.id)}
    </div>;
  }

  return <article ref={page} className="intro-experience" data-scene-state={displayState} data-scene-subject={subject} data-scene-objects={objects} data-ready={ready} data-exiting={!!exit} onPointerDown={startDrag}>
    <div ref={backdrop} className="intro-stage" data-act={act} data-dataset={dataset} data-claim={claimChecked ? "checked" : "open"}>
      <div ref={marquee} className="intro-marquee" aria-hidden="true"><div ref={marqueeTrack} className="intro-marquee-track">{[...introQuestions, ...introQuestions].map((question, index) => <span key={index}>{question}</span>)}</div></div>
      <div className="intro-fallback" aria-hidden="true">
        <div className="fallback-grid">{Array.from({ length: 24 }, (_, index) => <i key={index} data-tone={wallColorIndex(index)} />)}</div>
        <div className="fallback-stack">{introPromptParts.map((part) => <i key={part.id} data-on={parts.includes(part.id)} style={{ "--part": part.color } as CSSProperties} />)}</div>
        <span className="fallback-glyph glyph-star" style={{ "--spin": `${breaks * 72}deg` } as CSSProperties}>*</span>
        <span className="fallback-glyph glyph-bang">!</span>
        <span className="fallback-glyph glyph-question">?</span>
      </div>
      <div ref={canvasHost} className="intro-canvas" aria-hidden="true" />
    </div>
    {enabled && state === "error" && <div className="intro-recovery" role="status"><span>Typography mode. 3D unavailable.</span><button type="button" onClick={() => setAttempt((value) => value + 1)}>Retry 3D</button></div>}
    <div className="intro-progress" aria-hidden="true"><span ref={progressBar} /></div>
    <header className="intro-topbar"><Link href="/" className="wordmark" onClick={finish}>Wordplay.</Link><span>Interactive introduction</span><Link href={returnPath} onClick={finish} className="intro-skip">Skip intro</Link></header>
    <nav className="intro-index" aria-label="Introduction chapters"><ol>{introActs.map((item, index) => <li key={item.id}><a href={`#intro-act-${index}`} aria-current={act === index ? "step" : undefined}><span className="intro-index-label">{item.label}</span><i aria-hidden="true" /></a></li>)}</ol></nav>
    {introActs.map((item, index) => <section key={item.id} id={`intro-act-${index}`} data-act-section="" className={`intro-act is-${item.id}`} data-layout={item.layout} data-tone={item.tone} data-active={act === index} style={{ "--act-bg": item.background } as CSSProperties} aria-labelledby={`intro-act-${index}-title`}>
      <div className="intro-act-frame">
        {copy(index)}
        {index === 0 && displayState === "ready" && !dragged && <p className="intro-drag-hint" aria-hidden="true">Drag the question mark</p>}
      </div>
    </section>)}
    <div className="intro-wipe" data-open={!!exit} style={exit ? ({ "--wipe-x": `${exit.x}px`, "--wipe-y": `${exit.y}px` } as CSSProperties) : undefined} aria-hidden="true" />
  </article>;
}
