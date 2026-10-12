"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadTray, saveTray, toggleTerm, TRAY_KEY } from "@/engine/tray";
import type { TermLesson } from "@/engine/glossary";
import "./wordtray.css";

type TrayState = { terms: string[]; hydrated: boolean; error: string | null };
type TrayEntry = { term: string; definition: string; lessons: TermLesson[] };
type Subscriber = () => void;

const subscribers = new Set<Subscriber>();
let listeningForStorage = false;

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber());
}

function handleStorage(event: StorageEvent) {
  if (event.key === TRAY_KEY || event.key === null) notifySubscribers();
}

function subscribe(subscriber: Subscriber) {
  subscribers.add(subscriber);
  if (typeof window !== "undefined" && !listeningForStorage) {
    window.addEventListener("storage", handleStorage);
    listeningForStorage = true;
  }
  return () => { subscribers.delete(subscriber); };
}

const readError = "Your word tray could not be read from this browser.";
const writeError = "Your word tray could not be saved in this browser.";

export function useTray() {
  const [state, setState] = useState<TrayState>({ terms: [], hydrated: false, error: null });
  const read = useCallback(() => {
    const result = loadTray();
    setState({ terms: result.terms, hydrated: true, error: result.ok ? null : readError });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(read);
    read();
    return unsubscribe;
  }, [read]);

  const persist = useCallback((terms: string[]) => {
    if (!state.hydrated || terms.length === state.terms.length && terms.every((term, index) => term === state.terms[index])) return;
    if (!saveTray(terms)) {
      setState((current) => ({ ...current, error: writeError }));
      return;
    }
    notifySubscribers();
  }, [state.hydrated, state.terms]);

  const toggle = useCallback((term: string) => persist(toggleTerm(state.terms, term)), [persist, state.terms]);
  const remove = useCallback((term: string) => persist(state.terms.filter((saved) => saved !== term)), [persist, state.terms]);
  const clear = useCallback(() => persist([]), [persist]);

  return { ...state, toggle, remove, clear };
}

export function TrayToggle({ term, compact = false }: { term: string; compact?: boolean }) {
  const tray = useTray();
  const saved = tray.terms.includes(term);
  const label = compact ? (saved ? "✓" : "+") : (saved ? "✓ Saved" : "+ Save");
  return <button type="button" className={`tray-toggle${compact ? " tray-toggle--compact" : ""}`} aria-label={`Save ${term} to your word tray`} aria-pressed={saved} disabled={!tray.hydrated} onClick={() => tray.toggle(term)}>{label}</button>;
}

export function TrayChip() {
  const { terms, hydrated } = useTray();
  const pathname = usePathname();
  const count = hydrated ? terms.length : 0;
  return <Link href="/tray/" className="tray-chip" aria-label={`Word tray, ${count} saved`} aria-current={pathname === "/tray" || pathname.startsWith("/tray/") ? "page" : undefined}><span>Tray</span><span className="tray-chip-count" aria-hidden="true">{count}</span></Link>;
}

export function TrayPageContent({ entries }: { entries: TrayEntry[] }) {
  const tray = useTray();
  const [confirmClear, setConfirmClear] = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryByTerm = new Map(entries.map((entry) => [entry.term, entry]));
  const savedEntries = tray.terms.map((term) => entryByTerm.get(term)).filter((entry): entry is TrayEntry => Boolean(entry));

  const resetClear = useCallback(() => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = null;
    setConfirmClear(false);
  }, []);

  useEffect(() => () => { if (clearTimer.current) clearTimeout(clearTimer.current); }, []);

  function requestClear() {
    if (confirmClear) {
      tray.clear();
      resetClear();
      return;
    }
    setConfirmClear(true);
    clearTimer.current = setTimeout(resetClear, 4000);
  }

  return <section className="shell tray-content" aria-label="Saved words">
    <div className="tray-print-heading"><span className="wordmark">Wordplay.</span><h1>My AI study sheet</h1></div>
    <div className="tray-actions">
      <button type="button" className="button-primary" disabled={!tray.hydrated || savedEntries.length === 0} onClick={() => window.print()}>Print study sheet <span aria-hidden="true">↗</span></button>
      <button type="button" className="button-secondary" disabled={!tray.hydrated || savedEntries.length === 0} onClick={requestClear} onBlur={resetClear}>{confirmClear ? "Click again to clear" : "Clear tray"}</button>
    </div>
    <p className="tray-status" role="status" aria-live="polite">{savedEntries.length} words saved</p>
    {tray.error && <p className="tray-error" role="status">{tray.error}</p>}
    {savedEntries.length ? <ol className="tray-list">{savedEntries.map((entry) => <li className="tray-term" key={entry.term}>
      <article>
        <div className="tray-term-heading"><h2>{entry.term}</h2><button type="button" className="tray-entry-remove" aria-label={`Remove ${entry.term}`} onClick={() => tray.remove(entry.term)}>Remove</button></div>
        <p className="tray-definition">{entry.definition}</p>
        {entry.lessons.length > 0 && <p className="tray-lesson-links">Explained in {entry.lessons.map((lesson, index) => <span key={lesson.href}>{index > 0 && " · "}<Link href={lesson.href}>{lesson.title}</Link></span>)}</p>}
        <p className="tray-own-words"><span>In my own words:</span><span aria-hidden="true">_________________________</span></p>
      </article>
    </li>)}</ol> : <div className="tray-empty"><p>Your tray is empty.</p><Link href="/glossary/" className="text-link text-link--arrow"><span className="text-link-label">Find words to save </span><span aria-hidden="true">→</span></Link></div>}
    <p className="tray-print-footer">PROPERTY OF A CURIOUS STUDENT // STORED IN THIS BROWSER ONLY</p>
  </section>;
}
