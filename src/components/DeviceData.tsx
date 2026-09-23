"use client";

import { useCallback, useEffect, useState } from "react";
import { DRAFT_KEY } from "@/engine/drafts";
import { INTRO_KEY, INTRO_RETURN_KEY } from "@/engine/intro";
import { PROGRESS_KEY } from "@/engine/storage";
import { useProgress } from "@/state/ProgressProvider";
import { MOTION_KEY, useMotionPreference } from "./MotionPreferences";

type Row = { key: string; name: string; purpose: string; raw: string | null };

const stores = [
  { key: PROGRESS_KEY, name: "Learning progress", purpose: "Lessons read, activities, best quiz scores, XP, badges and your streak." },
  { key: DRAFT_KEY, name: "Prompt drafts", purpose: "Your Prompt Lab writing, so a refresh does not lose it." },
  { key: INTRO_KEY, name: "Intro seen", purpose: "Remembers that you already saw the first-visit introduction." },
  { key: MOTION_KEY, name: "Motion setting", purpose: "Your choice in the Motion menu in the footer." }
];
const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
const size = (raw: string | null) => raw ? `${new Blob([raw]).size} bytes` : "Empty";

function describe(key: string, raw: string | null) {
  if (!raw) return "Nothing saved";
  try {
    if (key === PROGRESS_KEY) {
      const value = JSON.parse(raw) as { completedLessons?: unknown[]; completedActivities?: unknown[]; quizBest?: object; xp?: number };
      return `${plural(value.completedLessons?.length ?? 0, "lesson")}, ${plural(value.completedActivities?.length ?? 0, "activity", "activities")}, ${plural(Object.keys(value.quizBest ?? {}).length, "quiz score")}, ${value.xp ?? 0} XP`;
    }
    if (key === DRAFT_KEY) {
      const drafts = Object.values((JSON.parse(raw) as { activities?: Record<string, string> }).activities ?? {}).filter((text) => typeof text === "string" && text.length > 0);
      return drafts.length ? `${plural(drafts.length, "draft")}, ${drafts.reduce((total, text) => total + text.length, 0)} characters` : "No drafts";
    }
    if (key === INTRO_KEY) {
      const date = new Date(raw);
      return Number.isNaN(date.getTime()) ? "Seen" : `Seen on ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (key === MOTION_KEY) return ({ system: "Follows your device", reduced: "Reduced motion", full: "Full motion" } as Record<string, string>)[raw] ?? raw;
  } catch {
    return "Saved, but not readable";
  }
  return "Saved";
}

function pretty(raw: string) {
  try { return JSON.stringify(JSON.parse(raw), null, 2); }
  catch { return raw; }
}

function forget(storage: () => Storage, key: string) {
  try { storage().removeItem(key); return true; }
  catch { return false; }
}

export function DeviceData() {
  const { state, reset } = useProgress();
  const { setPreference } = useMotionPreference();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const read = useCallback(() => {
    try { setRows(stores.map((store) => ({ ...store, raw: window.localStorage.getItem(store.key) }))); }
    catch { setRows([]); setMessage("This browser blocks storage, so Wordplay cannot keep anything here."); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(read, 0);
    return () => window.clearTimeout(timer);
  }, [read, state]);
  function clearAll() {
    reset();
    setPreference("system");
    const cleared = [DRAFT_KEY, INTRO_KEY, MOTION_KEY].map((key) => forget(() => window.localStorage, key)).every(Boolean) && forget(() => window.sessionStorage, INTRO_RETURN_KEY);
    setConfirm(false);
    setMessage(cleared ? "Cleared. Wordplay keeps one empty progress record so it can save again." : "Some items could not be cleared because this browser blocks storage.");
    window.setTimeout(read, 0);
  }
  const saved = rows?.filter((row) => row.raw) ?? [];
  return <section className="device-data" aria-labelledby="device-title"><div className="shell"><h2 id="device-title">What this browser is holding.</h2><p className="device-intro">Everything Wordplay has saved on this device, read live from your browser. None of it is sent anywhere.</p>{rows === null ? <p className="device-message" role="status">Reading this device…</p> : <ul className="device-rows">{rows.map((row, index) => <li key={row.key} data-empty={!row.raw} data-reveal={index}><div><h3>{row.name}</h3><p>{row.purpose}</p></div><p className="device-summary"><strong>{describe(row.key, row.raw)}</strong><span>{size(row.raw)}</span></p><code>{row.key}</code></li>)}</ul>}<details className="device-raw"><summary>Show the raw data</summary><pre>{saved.length ? saved.map((row) => `${row.key}\n${pretty(row.raw ?? "")}`).join("\n\n") : "Nothing saved yet."}</pre></details><div className="device-actions">{confirm ? <><p>Clear your progress, drafts and settings from this browser? This cannot be undone.</p><button type="button" className="button-secondary" onClick={() => setConfirm(false)}>Cancel</button><button type="button" className="button-primary" onClick={clearAll}>Yes, clear everything</button></> : <button type="button" className="button-secondary" onClick={() => setConfirm(true)}>Clear everything</button>}</div><p className="device-message" role="status">{message}</p></div></section>;
}
