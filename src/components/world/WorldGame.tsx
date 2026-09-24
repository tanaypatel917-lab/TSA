"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Application } from "@splinetool/runtime";
import { modules } from "@/content";
import { introPalette } from "@/content/intro";
import { missionFor, missions, type Mission } from "@/content/missions";
import { moduleVisuals, questionScene } from "@/content/visuals";
import { CRATE_REACH, GATE_REACH, WORLD, crateSpots, gateSpots, obstacles, stations, wordTokens, type WordToken } from "@/content/world";
import { todayKey } from "@/engine/dates";
import { termSlug } from "@/engine/glossary";
import { dailyPick, daySeed, deliver, pickUp, startRun, stars, tick as tickRun, type Difficulty, type Run } from "@/engine/mission";
import { boardKey, readBoard, recordScore, type ScoreEntry } from "@/engine/scores";
import { play, setSound, soundOn } from "./sound";
import { WORLD_XP, worldOf } from "@/engine/progress";
import { MOVE_KEYS, distance, inputFrom, nearest, startMover, step, type Point } from "@/engine/world";
import { useProgress } from "@/state/ProgressProvider";
import { useMotionPreference } from "../MotionPreferences";
import { MapMission } from "./MapMission";
import { MissionBriefing, Stars } from "./MissionBriefing";
import { MissionHud } from "./MissionHud";
import { MissionResults } from "./MissionResults";
import { WorldMap } from "./WorldMap";
import { createWorldScene, type WorldScene } from "./WorldScene";

type SceneState = "idle" | "loading" | "ready" | "error";
type Card = { token: WordToken; fresh: boolean };
type Phase = "countdown" | "playing" | "over";
type Results = { mission: Mission; run: Run; stars: number; best: boolean; stamped: boolean; perfect: boolean; daily: string | null; board: ScoreEntry[]; rank: number | null };
type Popup = { id: number; text: string; tone: "good" | "bad" | "info" };

const PAD: [string, string, Point][] = [["up", "Move up", { x: 0, z: -1 }], ["left", "Move left", { x: -1, z: 0 }], ["right", "Move right", { x: 1, z: 0 }], ["down", "Move down", { x: 0, z: 1 }]];
const moduleFor = (id: string) => modules.find((module) => module.id === id)!;
const interactive = (target: EventTarget | null) => target instanceof HTMLElement && !!target.closest("button, a, input, textarea, select, [role='dialog']");
const SCALE = 0.41 / 824;

function place(dx: number, dz: number, size: { w: number; h: number }, lift: number) {
  const k = SCALE * size.h;
  const cx = size.w / 2;
  const cy = size.h / 2;
  let x = cx + dx * k;
  let y = cy + dz * k * 0.93 - lift * size.h / 824;
  const margin = 64;
  const top = 170;
  const inside = x > margin && x < size.w - margin && y > top && y < size.h - margin;
  if (!inside) {
    const ax = x - cx;
    const ay = y - cy;
    const sx = (cx - margin) / Math.max(1, Math.abs(ax));
    const sy = (ay < 0 ? cy - top : size.h - margin - cy) / Math.max(1, Math.abs(ay));
    const scale = Math.min(sx, sy, 1);
    x = cx + ax * scale;
    y = cy + ay * scale;
  }
  return { x, y, edge: !inside, angle: (Math.atan2(dz, dx) * 180) / Math.PI };
}

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
  const toastTimer = useRef(0);
  const run = useRef<Run | null>(null);
  const mission = useRef<Mission | null>(null);
  const phase = useRef<Phase>("over");
  const countdownEnd = useRef(0);
  const popupId = useRef(0);
  const [device, setDevice] = useState({ checked: false, wide: false, coarse: false, webgl: false });
  const [choice, setChoice] = useState<"drive" | "map">("drive");
  const [sceneState, setSceneState] = useState<SceneState>("idle");
  const [attempt, setAttempt] = useState(0);
  const [objects, setObjects] = useState(0);
  const [near, setNear] = useState<string | null>(null);
  const [hud, setHud] = useState({ x: mover.current.x, z: mover.current.z, heading: mover.current.heading });
  const [size, setSize] = useState({ w: 1440, h: 824 });
  const [briefing, setBriefing] = useState<{ id: string; daily: boolean } | null>(null);
  const [mode, setMode] = useState<Difficulty>("standard");
  const [today, setToday] = useState<string | null>(null);
  const [sound, setSoundState] = useState(true);
  const dailyRun = useRef<string | null>(null);
  const [active, setActive] = useState<Mission | null>(null);
  const [runView, setRunView] = useState<Run | null>(null);
  const [mapRun, setMapRun] = useState<{ mission: Mission; run: Run } | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [shake, setShake] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [earned, setEarned] = useState(0);
  const sceneUrl = questionScene.url.trim();
  const capable = device.checked && !!sceneUrl && !reduced && device.wide && device.webgl;
  const drive = capable && choice === "drive" && sceneState !== "error";
  const displayState = !sceneUrl ? "disabled" : !device.checked ? "idle" : !capable ? "still" : sceneState;
  const dialogOpen = !!briefing || !!results || !!mapRun;
  const dailyMission = today ? missions[dailyPick(today, missions.length)] : null;
  const live = useRef({ drive, paused: false, near: null as string | null, stamped, dailyId: null as string | null });
  live.current = { drive: drive && sceneState === "ready", paused: dialogOpen, near, stamped, dailyId: dailyMission?.moduleId ?? null };
  const progress = useRef(world);
  progress.current = world;

  useEffect(() => { got.current = new Set(world.words); }, [world.words]);
  useEffect(() => { setToday(todayKey()); setSoundState(soundOn()); }, []);

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

  const pop = useCallback((text: string, tone: Popup["tone"]) => {
    const id = ++popupId.current;
    setPopups((items) => [...items.slice(-3), { id, text, tone }]);
    window.setTimeout(() => setPopups((items) => items.filter((item) => item.id !== id)), 1100);
  }, []);

  const say = useCallback((text: string, ok: boolean) => {
    window.clearTimeout(toastTimer.current);
    setToast({ text, ok });
    toastTimer.current = window.setTimeout(() => setToast(null), ok ? 2200 : 4200);
  }, []);

  const collect = useCallback((token: WordToken, fromDrive: boolean) => {
    if (got.current.has(token.term)) return;
    got.current.add(token.term);
    dispatch({ type: "word-collected", term: token.term, day: todayKey() });
    setEarned((value) => value + WORLD_XP.word);
    showCard({ token, fresh: true }, fromDrive);
  }, [dispatch, showCard]);

  const openBriefing = useCallback((id: string, daily = false) => {
    opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    keys.current.clear();
    pad.current = { x: 0, z: 0 };
    setBriefing({ id, daily });
  }, []);

  const refocus = useCallback(() => {
    const target = opener.current && document.contains(opener.current) ? opener.current : stage.current;
    window.requestAnimationFrame(() => target?.focus());
  }, []);

  const finish = useCallback((current: Mission, done: Run) => {
    const earnedStars = stars(done);
    const before = progress.current;
    const wasStamped = before.stamps.includes(current.moduleId);
    const daily = dailyRun.current;
    const day = todayKey();
    const { board, rank } = recordScore(daily ? `daily:${daily}` : boardKey(current.moduleId, done.mode), { score: done.score, stars: earnedStars, day, at: Date.now() });
    const record = { mission: current, run: done, stars: earnedStars, best: done.score > (before.best?.[current.moduleId] ?? 0) && done.score > 0, stamped: earnedStars >= 1 && !wasStamped, perfect: earnedStars === 3 && (before.stars?.[current.moduleId] ?? 0) < 3, daily, board, rank };
    play(earnedStars ? "win" : "lose");
    dispatch({ type: "mission-finished", moduleId: current.moduleId, score: done.score, stars: earnedStars, day: todayKey() });
    setEarned((value) => value + (record.stamped ? WORLD_XP.stamp : 0) + (record.perfect ? WORLD_XP.perfect : 0));
    setResults(record);
  }, [dispatch]);

  const endDrive = useCallback(() => {
    mission.current = null;
    run.current = null;
    phase.current = "over";
    setActive(null);
    setRunView(null);
    setCountdown(null);
    setBanner(null);
  }, []);

  const start = useCallback((id: string, daily = false) => {
    const current = missionFor(id);
    const day = todayKey();
    dailyRun.current = daily ? day : null;
    const fresh = startRun(current, crateSpots, { seed: daily ? daySeed(day) : Date.now() % 9973, mode: daily ? "standard" : mode });
    setBriefing(null);
    setResults(null);
    if (!drive) { setMapRun({ mission: current, run: fresh }); return; }
    mover.current = startMover();
    keys.current.clear();
    mission.current = current;
    run.current = fresh;
    phase.current = "countdown";
    countdownEnd.current = performance.now() + 3000;
    setActive(current);
    setRunView(fresh);
    setCountdown(3);
    setToast(null);
    window.requestAnimationFrame(() => stage.current?.focus());
  }, [drive, mode]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const current = live.current;
      if (event.key === "Escape" && mission.current && !current.paused) { event.preventDefault(); endDrive(); return; }
      if (!current.drive || current.paused) return;
      if (MOVE_KEYS.has(event.code) && !(event.target instanceof HTMLElement && event.target.closest("input, textarea, select"))) {
        keys.current.add(event.code);
        event.preventDefault();
      } else if ((event.key === "Enter" || event.key === " " || event.code === "KeyE") && current.near && !mission.current && !interactive(event.target)) {
        event.preventDefault();
        openBriefing(current.near === "daily" ? current.dailyId ?? current.near : current.near, current.near === "daily");
      }
    };
    const up = (event: KeyboardEvent) => { keys.current.delete(event.code); };
    const clear = () => { keys.current.clear(); pad.current = { x: 0, z: 0 }; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", clear); };
  }, [openBriefing, endDrive]);

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
    const measure = () => {
      setSize({ w: container.clientWidth || 1440, h: container.clientHeight || 824 });
      if (!active || !loaded || !instance) return;
      instance.setSize(container.clientWidth, container.clientHeight);
      scene.current?.refresh();
    };
    const resize = new ResizeObserver(measure);
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
        measure();
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
    let lastCount = -1;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const current = live.current;
      const activeMission = mission.current;
      let currentRun = run.current;
      const locked = current.paused || phase.current !== "playing" && !!activeMission;
      const keyed = inputFrom(keys.current);
      const input = locked ? { x: 0, z: 0 } : { x: keyed.x || pad.current.x, z: keyed.z || pad.current.z };
      mover.current = step(mover.current, input, dt, WORLD.radius, obstacles);
      const station = activeMission ? null : nearest(mover.current, stations, WORLD.reach)?.moduleId ?? (Math.hypot(mover.current.x, mover.current.z) < 270 ? "daily" : null);
      if (station !== current.near) setNear(station);
      if (!activeMission && !current.paused) {
        const token = nearest(mover.current, wordTokens.filter((item) => !got.current.has(item.term)), WORLD.pickup);
        if (token) collect(token, true);
      }
      if (activeMission && currentRun) {
        if (phase.current === "countdown") {
          const left = Math.max(0, Math.ceil((countdownEnd.current - now) / 1000));
          if (left !== lastCount) { lastCount = left; setCountdown(left); play(left > 0 ? "tick" : "go"); }
          if (now >= countdownEnd.current) { phase.current = "playing"; window.setTimeout(() => setCountdown(null), 650); }
        } else if (phase.current === "playing") {
          currentRun = tickRun(currentRun, dt);
          if (currentRun.carrying === null) {
            const index = currentRun.field.findIndex((crate) => distance(mover.current, crate) < CRATE_REACH);
            if (index >= 0) {
              const crate = currentRun.field[index];
              currentRun = pickUp(currentRun, index, crateSpots);
              scene.current?.burst(crate.x, crate.z, introPalette.slate, 8);
              pop("Picked up", "info");
              play("pickup");
            }
          } else {
            const gate = gateSpots.findIndex((spot) => distance(mover.current, spot) < GATE_REACH);
            if (gate >= 0) {
              const result = deliver(currentRun, activeMission.gates[gate].id, activeMission);
              if (result) {
                currentRun = result.run;
                const item = activeMission.items[result.item];
                const right = activeMission.gates.find((each) => each.id === item.gate)!;
                scene.current?.burst(gateSpots[gate].x, gateSpots[gate].z, result.ok ? introPalette.sky : introPalette.clay, 16);
                play(result.ok ? "good" : "bad");
                if (result.ok) { pop(`+${result.points}${result.run.combo > 1 ? `  ×${result.run.combo}` : ""}`, "good"); say(`${right.label}. ${item.why}`, true); }
                else { pop("Wrong gate", "bad"); say(`That one belongs in ${right.label}. ${item.why}`, false); setShake((value) => value + 1); }
              }
            }
          }
          run.current = currentRun;
          if (currentRun.over) {
            phase.current = "over";
            const done = currentRun;
            setRunView(done);
            setBanner(done.over === "cleared" ? "All sorted!" : done.over === "time" ? "Time!" : "Run over");
            window.setTimeout(() => { endDrive(); finish(activeMission, done); }, 1300);
          }
        }
      }
      const sceneRun = run.current;
      scene.current?.update({
        mover: mover.current,
        time: now / 1000,
        collected: got.current,
        stamped: current.stamped,
        near: station,
        mission: activeMission && sceneRun ? { colors: [activeMission.gates[0].color, activeMission.gates[1].color], carrying: sceneRun.carrying !== null } : null,
        crates: sceneRun?.field ?? []
      });
      if (now - lastHud > 80) {
        lastHud = now;
        setHud({ x: mover.current.x, z: mover.current.z, heading: mover.current.heading });
        if (run.current) setRunView(run.current);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [drive, sceneState, collect, pop, say, finish, endDrive]);

  useEffect(() => () => { window.clearTimeout(cardTimer.current); window.clearTimeout(toastTimer.current); }, []);

  const pressPad = (direction: Point) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pad.current = direction;
  };
  const releasePad = () => { pad.current = { x: 0, z: 0 }; };

  const nearStation = near ? stations.find((station) => station.moduleId === near) : undefined;
  const briefStation = briefing ? stations.find((station) => station.moduleId === briefing.id) : undefined;
  const toggleSound = () => { const next = !sound; setSound(next); setSoundState(next); if (next) play("pickup"); };
  const carriedItem = active && runView?.carrying != null ? active.items[runView.carrying] : null;
  const reason = !sceneUrl ? "3D is switched off in this build, so the world opens as a map."
    : reduced ? "Reduced motion is on, so the world opens as a map."
    : device.checked && !device.wide ? "The 3D world needs a wider screen, so here is the map."
    : device.checked && !device.webgl ? "This browser cannot draw 3D, so here is the map."
    : sceneState === "error" ? "The 3D world could not load. The map works the same way." : "";

  return <section className="world" data-mode={drive ? "drive" : "map"} data-scene-state={displayState} data-scene-objects={objects} data-mission={active ? active.moduleId : undefined} aria-labelledby="world-title">
    <div
      ref={stage}
      className="world-stage"
      data-shake={shake ? (shake % 2 ? "a" : "b") : undefined}
      tabIndex={drive ? 0 : -1}
      role={drive ? "application" : undefined}
      aria-label={drive ? "Wordplay World. Use the arrow keys or W A S D to move." : undefined}
      aria-describedby="world-help"
    >
      <div ref={canvasHost} className="world-canvas" hidden={!drive} />
      {drive && sceneState !== "ready" && <p className="world-loading" role="status">Building the island…</p>}
      {!drive && <div className="world-map-view">
        <WorldMap variant="full" collected={collected} stamped={stamped} onStation={openBriefing} onWord={(token) => showCard({ token, fresh: !collected.has(token.term) }, false)} />
      </div>}
    </div>

    {active && runView && <div className="mission-layer" aria-hidden="false">
      {gateSpots.map((spot, index) => {
        const where = place(spot.x - hud.x, spot.z - hud.z, size, 190);
        const gate = active.gates[index];
        return <div key={gate.id} className="gate-label" data-edge={where.edge} data-live={runView.carrying !== null} style={{ left: where.x, top: where.y, "--gate": gate.color, "--angle": `${where.angle}deg` } as CSSProperties}><span className="gate-arrow" aria-hidden="true">➜</span>{gate.label}</div>;
      })}
      {runView.carrying === null && runView.field.map((crate, index) => {
        const where = place(crate.x - hud.x, crate.z - hud.z, size, 150);
        return <div key={`${crate.x},${crate.z}`} className="crate-pin" data-edge={where.edge} style={{ left: where.x, top: where.y, "--angle": `${where.angle}deg`, animationDelay: `${index * 120}ms` } as CSSProperties} aria-hidden="true"><span className="gate-arrow">➜</span>!</div>;
      })}
      {carriedItem && <div className="carry-bubble" role="status">
        {carriedItem.context && <p className="carry-context">{carriedItem.context}</p>}
        <p className="carry-text">{carriedItem.text}</p>
        <p className="carry-hint">Drive it into <strong style={{ color: active.gates[0].color }}>{active.gates[0].label}</strong> or <strong style={{ color: active.gates[1].color }}>{active.gates[1].label}</strong></p>
      </div>}
      {!carriedItem && phase.current === "playing" && <p className="carry-bubble is-hint" role="status">Grab a crate. Follow the <strong>!</strong> pins.</p>}
      <div className="popups" aria-hidden="true">{popups.map((item) => <span key={item.id} data-tone={item.tone}>{item.text}</span>)}</div>
      {countdown !== null && <div className="countdown" aria-live="assertive" key={countdown}>{countdown > 0 ? countdown : "Go!"}</div>}
      {banner && <div className="countdown is-banner" aria-live="assertive">{banner}</div>}
      <MissionHud mission={active} run={runView} onQuit={endDrive} sound={sound} onSound={toggleSound} />
      {toast && <p className="mission-toast" data-ok={toast.ok} role="status">{toast.text}</p>}
    </div>}

    {!active && <header className="world-hud">
      <div className="world-heading">
        <p className="world-kicker"><Link href="/">Wordplay</Link> · Game mode</p>
        <h1 id="world-title">Wordplay World</h1>
        <dl className="world-counts" aria-live="polite">
          <div><dt>Stamps</dt><dd>{hydrated ? stamped.size : "–"}<span>/{stations.length}</span></dd></div>
          <div><dt>Words</dt><dd>{hydrated ? collected.size : "–"}<span>/{wordTokens.length}</span></dd></div>
          <div><dt>This visit</dt><dd>+{earned}<span> XP</span></dd></div>
        </dl>
      </div>
      <div className="world-actions">
        <button type="button" className="world-toggle" aria-pressed={sound} onClick={toggleSound}>{sound ? "Sound on" : "Sound off"}</button>
        {capable && sceneState !== "error" && <button type="button" className="world-toggle" aria-pressed={choice === "map"} onClick={() => setChoice((value) => value === "drive" ? "map" : "drive")}>{choice === "drive" ? "Map view" : "3D view"}</button>}
        {capable && sceneState === "error" && <button type="button" className="world-toggle" onClick={() => { setChoice("drive"); setAttempt((value) => value + 1); }}>Retry 3D</button>}
      </div>
    </header>}
    {active && <h1 id="world-title" className="sr-only">Wordplay World</h1>}

    {drive && !active && <WorldMap variant="mini" collected={collected} stamped={stamped} player={hud} near={near} />}

    {!active && <p id="world-help" className="world-help">{drive ? <>Move with <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>. Drive to a station and press <kbd>Enter</kbd> to start its mission. Collect words on the way.</> : <>{reason && <strong>{reason} </strong>}Choose a station to play its mission, or a word to read and collect it.</>}</p>}

    {drive && near === "daily" && dailyMission && !active && !dialogOpen && <div className="world-prompt is-daily">
      <p><span>Daily challenge · {today}</span> {dailyMission.title}</p>
      <button type="button" className="button-primary" onClick={() => openBriefing(dailyMission.moduleId, true)}>Play the daily <kbd aria-hidden="true">Enter</kbd></button>
    </div>}

    {drive && nearStation && !active && !dialogOpen && <div className="world-prompt">
      <p><span>Station {nearStation.number} · {moduleFor(nearStation.moduleId).title}</span> {missionFor(nearStation.moduleId).title}{world.stars?.[nearStation.moduleId] ? <Stars count={world.stars[nearStation.moduleId]} /> : null}</p>
      <button type="button" className="button-primary" onClick={() => openBriefing(nearStation.moduleId)}>Start mission <kbd aria-hidden="true">Enter</kbd></button>
    </div>}

    {card && !active && <aside className="word-card" aria-live="polite" style={{ "--token": card.token.color } as CSSProperties}>
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
        <h2>Missions</h2>
        {dailyMission && <button type="button" className="world-daily" onClick={() => openBriefing(dailyMission.moduleId, true)}><span className="list-mark" aria-hidden="true">☀</span><span><strong>Daily challenge · {today}</strong> {dailyMission.title}</span><span className="list-state">Same crates for everyone today</span></button>}
        <ol className="world-station-list">{stations.map((station) => {
          const done = stamped.has(station.moduleId);
          const starsEarned = world.stars?.[station.moduleId] ?? 0;
          return <li key={station.moduleId}><button type="button" onClick={() => openBriefing(station.moduleId)} data-stamped={done}><span className="list-mark" aria-hidden="true">{done ? "✓" : moduleVisuals[station.moduleId].mark}</span><span><strong>Station {station.number} · {moduleFor(station.moduleId).title}</strong> {missionFor(station.moduleId).title}</span><span className="list-state">{starsEarned ? <Stars count={starsEarned} /> : `+${WORLD_XP.stamp} XP`}</span></button></li>;
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

    {briefing && briefStation && <MissionBriefing station={briefStation} module={moduleFor(briefing.id)} mission={missionFor(briefing.id)} stamped={stamped.has(briefing.id)} bestStars={world.stars?.[briefing.id]} mode={mode} daily={briefing.daily ? today : null} board={readBoard(briefing.daily && today ? `daily:${today}` : boardKey(briefing.id, mode))} driving={drive} onMode={setMode} onStart={() => start(briefing.id, briefing.daily)} onClose={() => { setBriefing(null); refocus(); }} />}
    {mapRun && <MapMission mission={mapRun.mission} start={mapRun.run} sound={sound} onSound={toggleSound} onFinish={(done) => { const current = mapRun.mission; setMapRun(null); finish(current, done); }} onQuit={() => { setMapRun(null); refocus(); }} />}
    {results && <MissionResults {...results} onAgain={() => start(results.mission.moduleId, !!results.daily)} onClose={() => { setResults(null); refocus(); }} />}
  </section>;
}
