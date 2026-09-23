"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { Application } from "@splinetool/runtime";
import { modules } from "@/content";
import { moduleVisuals, questionScene } from "@/content/visuals";
import { WORLD, obstacles, stations, wordTokens, type WordToken } from "@/content/world";
import { todayKey } from "@/engine/dates";
import { termSlug } from "@/engine/glossary";
import { WORLD_XP, worldOf } from "@/engine/progress";
import { MOVE_KEYS, inputFrom, nearest, startMover, step, type Point } from "@/engine/world";
import { useProgress } from "@/state/ProgressProvider";
import { useMotionPreference } from "../MotionPreferences";
import { StationPanel } from "./StationPanel";
import { WorldMap } from "./WorldMap";
import { createWorldScene, type WorldScene } from "./WorldScene";

type SceneState = "idle" | "loading" | "ready" | "error";
type Card = { token: WordToken; fresh: boolean };

const PAD: [string, string, Point][] = [["up", "Move up", { x: 0, z: -1 }], ["left", "Move left", { x: -1, z: 0 }], ["right", "Move right", { x: 1, z: 0 }], ["down", "Move down", { x: 0, z: 1 }]];
const moduleFor = (id: string) => modules.find((module) => module.id === id)!;
const interactive = (target: EventTarget | null) => target instanceof HTMLElement && !!target.closest("button, a, input, textarea, select, [role='dialog']");

export function WorldGame() {
  const { state, dispatch, hydrated } = useProgress();
  const { reduced } = useMotionPreference();
  const world = worldOf(state);
  const collected = useMemo(() => new Set(world.words), [world.words]);
  const stamped = useMemo(() => new Set(world.stamps), [world.stamps]);
  const canvasHost = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<WorldScene>();
  const mover = useRef(startMover());
  const keys = useRef(new Set<string>());
  const pad = useRef<Point>({ x: 0, z: 0 });
  const got = useRef(new Set<string>());
  const opener = useRef<HTMLElement | null>(null);
  const cardTimer = useRef(0);
  const [device, setDevice] = useState({ checked: false, wide: false, coarse: false, webgl: false });
  const [choice, setChoice] = useState<"drive" | "map">("drive");
  const [sceneState, setSceneState] = useState<SceneState>("idle");
  const [attempt, setAttempt] = useState(0);
  const [objects, setObjects] = useState(0);
  const [near, setNear] = useState<string | null>(null);
  const [hud, setHud] = useState({ x: mover.current.x, z: mover.current.z, heading: mover.current.heading });
  const [open, setOpen] = useState<string | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [earned, setEarned] = useState(0);
  const sceneUrl = questionScene.url.trim();
  const capable = device.checked && !!sceneUrl && !reduced && device.wide && device.webgl;
  const drive = capable && choice === "drive" && sceneState !== "error";
  const displayState = !sceneUrl ? "disabled" : !device.checked ? "idle" : !capable ? "still" : sceneState;
  const live = useRef({ drive, paused: false, near: null as string | null, collected, stamped });
  live.current = { drive: drive && sceneState === "ready", paused: !!open, near, collected, stamped };

  useEffect(() => { got.current = new Set(world.words); }, [world.words]);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let webgl = false;
    try { const probe = document.createElement("canvas"); webgl = !!(probe.getContext("webgl2") ?? probe.getContext("webgl")); } catch {}
    const update = () => setDevice({ checked: true, wide: wide.matches, coarse: coarse.matches, webgl });
    update();
    wide.addEventListener("change", update);
    coarse.addEventListener("change", update);
    return () => { wide.removeEventListener("change", update); coarse.removeEventListener("change", update); };
  }, []);

  const showCard = useCallback((next: Card, linger: boolean) => {
    window.clearTimeout(cardTimer.current);
    setCard(next);
    if (linger) cardTimer.current = window.setTimeout(() => setCard(null), 6000);
  }, []);

  const collect = useCallback((token: WordToken, fromDrive: boolean) => {
    if (got.current.has(token.term)) return;
    got.current.add(token.term);
    dispatch({ type: "word-collected", term: token.term, day: todayKey() });
    setEarned((value) => value + WORLD_XP.word);
    showCard({ token, fresh: true }, fromDrive);
  }, [dispatch, showCard]);

  const openStation = useCallback((id: string) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    keys.current.clear();
    pad.current = { x: 0, z: 0 };
    setOpen(id);
  }, []);

  const closeStation = useCallback(() => {
    setOpen(null);
    const target = opener.current && document.contains(opener.current) && opener.current !== document.body ? opener.current : stage.current;
    window.requestAnimationFrame(() => target?.focus());
  }, []);

  const stamp = useCallback((id: string) => {
    dispatch({ type: "station-stamped", moduleId: id, day: todayKey() });
    setEarned((value) => value + WORLD_XP.stamp);
  }, [dispatch]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const current = live.current;
      if (!current.drive || current.paused) return;
      if (MOVE_KEYS.has(event.code) && !(event.target instanceof HTMLElement && event.target.closest("input, textarea, select"))) {
        keys.current.add(event.code);
        event.preventDefault();
      } else if ((event.key === "Enter" || event.key === " " || event.code === "KeyE") && current.near && !interactive(event.target)) {
        event.preventDefault();
        openStation(current.near);
      }
    };
    const up = (event: KeyboardEvent) => { keys.current.delete(event.code); };
    const clear = () => { keys.current.clear(); pad.current = { x: 0, z: 0 }; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", clear); };
  }, [openStation]);

  useEffect(() => {
    if (!capable || !canvasHost.current) return;
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
    setSceneState("loading");
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
      setSceneState("error");
    }, 20000);
    async function load() {
      try {
        const { Application } = await import("@splinetool/runtime");
        if (!active || timedOut) return;
        instance = new Application(canvas, { renderMode: "auto", renderer: "webgl", htmlContentMode: "none" });
        await instance.load(sceneUrl, undefined, { signal: controller.signal });
        if (!active || timedOut) { dispose(); return; }
        const built = await createWorldScene(instance, questionScene.subject);
        if (!active || timedOut) { dispose(); return; }
        loaded = true;
        window.clearTimeout(timeout);
        instance.setBackgroundColor("transparent");
        size();
        playback();
        scene.current = built;
        setObjects(built.objectCount);
        setSceneState("ready");
      } catch {
        dispose();
        if (active && !timedOut) setSceneState("error");
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
      setSceneState("idle");
    };
  }, [capable, sceneUrl, attempt]);

  useEffect(() => {
    if (!drive || sceneState !== "ready") return;
    let frame = 0;
    let last = performance.now();
    let lastHud = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const current = live.current;
      const keyed = inputFrom(keys.current);
      const input = current.paused ? { x: 0, z: 0 } : { x: keyed.x || pad.current.x, z: keyed.z || pad.current.z };
      mover.current = step(mover.current, input, dt, WORLD.radius, obstacles);
      const station = nearest(mover.current, stations, WORLD.reach)?.moduleId ?? null;
      if (station !== current.near) setNear(station);
      if (!current.paused) {
        const token = nearest(mover.current, wordTokens.filter((item) => !got.current.has(item.term)), WORLD.pickup);
        if (token) collect(token, true);
      }
      scene.current?.update({ mover: mover.current, time: now / 1000, collected: got.current, stamped: current.stamped, near: station });
      if (now - lastHud > 90) {
        lastHud = now;
        setHud({ x: mover.current.x, z: mover.current.z, heading: mover.current.heading });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [drive, sceneState, collect]);

  useEffect(() => () => window.clearTimeout(cardTimer.current), []);

  const pressPad = (direction: Point) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pad.current = direction;
  };
  const releasePad = () => { pad.current = { x: 0, z: 0 }; };

  const nearStation = near ? stations.find((station) => station.moduleId === near) : undefined;
  const openModule = open ? moduleFor(open) : undefined;
  const openStationData = open ? stations.find((station) => station.moduleId === open) : undefined;
  const reason = !sceneUrl ? "3D is switched off in this build, so the world opens as a map."
    : reduced ? "Reduced motion is on, so the world opens as a map."
    : device.checked && !device.wide ? "The 3D world needs a wider screen, so here is the map."
    : device.checked && !device.webgl ? "This browser cannot draw 3D, so here is the map."
    : sceneState === "error" ? "The 3D world could not load. The map works the same way." : "";

  return <section className="world" data-mode={drive ? "drive" : "map"} data-scene-state={displayState} data-scene-objects={objects} aria-labelledby="world-title">
    <div
      ref={stage}
      className="world-stage"
      tabIndex={drive ? 0 : -1}
      role={drive ? "application" : undefined}
      aria-label={drive ? "Wordplay World. Use the arrow keys or W A S D to move." : undefined}
      aria-describedby="world-help"
    >
      <div ref={canvasHost} className="world-canvas" hidden={!drive} />
      {drive && sceneState !== "ready" && <p className="world-loading" role="status">Building the island…</p>}
      {!drive && <div className="world-map-view">
        <WorldMap variant="full" collected={collected} stamped={stamped} onStation={openStation} onWord={(token) => showCard({ token, fresh: !collected.has(token.term) }, false)} />
      </div>}
    </div>

    <header className="world-hud">
      <div className="world-heading">
        <p className="world-kicker"><Link href="/">Wordplay</Link> · Game mode</p>
        <h1 id="world-title">Wordplay World</h1>
        <dl className="world-counts" aria-live="polite">
          <div><dt>Words</dt><dd>{hydrated ? collected.size : "–"}<span>/{wordTokens.length}</span></dd></div>
          <div><dt>Stamps</dt><dd>{hydrated ? stamped.size : "–"}<span>/{stations.length}</span></dd></div>
          <div><dt>This visit</dt><dd>+{earned}<span> XP</span></dd></div>
        </dl>
      </div>
      <div className="world-actions">
        {capable && sceneState !== "error" && <button type="button" className="world-toggle" aria-pressed={choice === "map"} onClick={() => setChoice((value) => value === "drive" ? "map" : "drive")}>{choice === "drive" ? "Map view" : "3D view"}</button>}
        {capable && sceneState === "error" && <button type="button" className="world-toggle" onClick={() => { setChoice("drive"); setAttempt((value) => value + 1); }}>Retry 3D</button>}
      </div>
    </header>

    {drive && <WorldMap variant="mini" collected={collected} stamped={stamped} player={hud} near={near} />}

    <p id="world-help" className="world-help">{drive ? <>Move with <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>. Drive through a word to collect it. At a station, press <kbd>Enter</kbd>.</> : <>{reason && <strong>{reason} </strong>}Choose a station to take its check, or a word to read and collect it.</>}</p>

    {drive && nearStation && !open && <div className="world-prompt">
      <p><span>Station {nearStation.number}</span> {moduleFor(nearStation.moduleId).title}{stamped.has(nearStation.moduleId) ? " · stamped" : ""}</p>
      <button type="button" className="button-primary" onClick={() => openStation(nearStation.moduleId)}>Open station <kbd aria-hidden="true">Enter</kbd></button>
    </div>}

    {card && <aside className="word-card" aria-live="polite" style={{ "--token": card.token.color } as React.CSSProperties}>
      <p className="word-card-kicker">{!card.fresh ? "Collected word" : collected.has(card.token.term) ? `New word · +${WORLD_XP.word} XP` : "Word to collect"}</p>
      <h2>{card.token.term}</h2>
      <p>{card.token.definition}</p>
      <div className="word-card-actions">
        {!collected.has(card.token.term) && <button type="button" className="button-primary" onClick={() => collect(card.token, false)}>Collect · +{WORLD_XP.word} XP</button>}
        <Link href={`/glossary/#term-${termSlug(card.token.term)}`} className="text-link">In the glossary <span aria-hidden="true">↗</span></Link>
        <button type="button" className="word-card-close" onClick={() => setCard(null)} aria-label="Close word card">×</button>
      </div>
    </aside>}

    {drive && device.coarse && <div className="world-pad" aria-label="Movement controls">
      {PAD.map(([id, label, direction]) => <button key={id} type="button" className={`pad-${id}`} aria-label={label} onPointerDown={pressPad(direction)} onPointerUp={releasePad} onPointerCancel={releasePad} onLostPointerCapture={releasePad}><span aria-hidden="true">{id === "up" ? "↑" : id === "down" ? "↓" : id === "left" ? "←" : "→"}</span></button>)}
    </div>}

    {!drive && <section className="world-lists" aria-label="Stations and words">
      <div>
        <h2>Stations</h2>
        <ol className="world-station-list">{stations.map((station) => {
          const done = stamped.has(station.moduleId);
          return <li key={station.moduleId}><button type="button" onClick={() => openStation(station.moduleId)} data-stamped={done}><span className="list-mark" aria-hidden="true">{done ? "✓" : moduleVisuals[station.moduleId].mark}</span><span><strong>Station {station.number}</strong> {moduleFor(station.moduleId).title}</span><span className="list-state">{done ? "Stamped" : `+${WORLD_XP.stamp} XP`}</span></button></li>;
        })}</ol>
      </div>
      <div>
        <h2>Words <span>{collected.size} of {wordTokens.length}</span></h2>
        <ul className="world-word-list">{wordTokens.map((token) => {
          const done = collected.has(token.term);
          return <li key={token.term}><button type="button" data-collected={done} onClick={() => showCard({ token, fresh: !done }, false)}>{token.term}<span className="sr-only">{done ? ", collected" : ", not collected"}</span></button></li>;
        })}</ul>
      </div>
    </section>}

    {openModule && openStationData && <StationPanel station={openStationData} module={openModule} stamped={stamped.has(openModule.id)} onStamp={() => stamp(openModule.id)} onClose={closeStation} />}
  </section>;
}
