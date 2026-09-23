"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Activity } from "@/content/types";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";
import { evaluatePrompt } from "@/engine/prompt";
import { clearDraft, DRAFT_LIMIT, loadDraft, saveDraft } from "@/engine/drafts";

type SaveState = "loading" | "empty" | "saving" | "saved" | "error" | "cleared";
const saveLabels: Record<SaveState, string> = { loading: "Checking this device for a draft…", empty: "Your draft will save on this device.", saving: "Unsaved changes…", saved: "Draft saved on this device.", error: "Draft not saved. Keep a copy of your text before leaving.", cleared: "Draft cleared from this device." };

export function PromptLab({ activity, moduleId }: { activity: Extract<Activity, { kind: "prompt-lab" }>; moduleId: string }) {
  const { state, dispatch, hydrated, storageError } = useProgress();
  const [text, setText] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const latest = useRef("");
  const dirty = useRef(false);
  const mounted = useRef(false);
  const completedHere = useRef(false);
  const draftId = `${moduleId}/${activity.id}`;
  const completed = hydrated && state.completedActivities.includes(moduleId);
  const { checks, score, ready } = evaluatePrompt(text, activity.rubric);
  const flush = useCallback(() => {
    if (!dirty.current) return;
    const ok = saveDraft(draftId, latest.current);
    if (ok) dirty.current = false;
    if (mounted.current) setSaveState(ok ? "saved" : "error");
  }, [draftId]);

  useEffect(() => {
    mounted.current = true;
    const draft = loadDraft(draftId);
    latest.current = draft.text;
    setText(draft.text);
    setSaveState(!draft.ok ? "error" : draft.text ? "saved" : "empty");
    setDraftReady(true);
    const hide = () => { if (document.hidden) flush(); };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", hide);
    return () => {
      mounted.current = false;
      flush();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [draftId, flush]);
  useEffect(() => {
    if (!draftReady || !dirty.current) return;
    const timer = window.setTimeout(flush, 500);
    return () => window.clearTimeout(timer);
  }, [text, draftReady, flush]);

  function change(value: string) {
    latest.current = value;
    dirty.current = true;
    setText(value);
    setSaveState("saving");
  }
  function clear() {
    if (!clearDraft(draftId)) { setSaveState("error"); return; }
    dirty.current = false;
    latest.current = "";
    setText("");
    setSaveState("cleared");
  }
  function complete() {
    if (!hydrated || !ready || completed || completedHere.current) return;
    completedHere.current = true;
    flush();
    dispatch({ type: "activity-completed", moduleId, day: todayKey() });
  }

  return <div className="prompt-lab"><div className="prompt-grid"><aside className="prompt-brief"><h2>The starting point</h2><blockquote>{activity.weakPrompt}</blockquote><p>A vague prompt leaves the choices to the tool. Give it a purpose, an audience, and a shape for the answer.</p><div className="prompt-brackets" aria-hidden="true"><span>[</span><span>?</span><span>]</span></div></aside><div className="prompt-editor"><label htmlFor="improved-prompt">Your improved prompt</label><p id="prompt-help">Rewrite the prompt. Include at least four of the five rubric terms below.</p><textarea id="improved-prompt" aria-describedby="prompt-help draft-status" rows={7} maxLength={DRAFT_LIMIT} disabled={!draftReady} value={text} onChange={(event) => change(event.target.value)} placeholder="Give the tool a clear role, task, context, format, and constraints…" /><div className="draft-toolbar"><p id="draft-status" role="status" className="draft-status" data-error={saveState === "error"}>{saveLabels[saveState]}</p><button disabled={!draftReady || (!text && saveState !== "error")} onClick={clear}>Clear draft</button></div><div className="rubric-heading"><h2>Give your words a job.</h2><p>Local keyword coverage, not an AI score.</p></div><ul className="rubric-list">{checks.map((rule) => <li key={rule.id} data-passed={rule.ok}><strong>{rule.label}</strong><span>{rule.ok ? "Passed" : "Missing"}</span></li>)}</ul><div className="prompt-completion"><p aria-live="polite">{score}/5 rubric points — {ready ? "Ready to complete!" : "Add details to reach 4/5."}</p><button className="button-primary" onClick={complete} disabled={!hydrated || !ready || completed}>{completed ? "Activity complete" : "Complete prompt lab"}</button></div>{completed && <p className="mt-4 text-sm" role="status">Activity complete. You can keep editing; completing it again won’t award extra XP.</p>}{storageError && <p role="status" className="storage-warning">{storageError}</p>}<p className="small-note prompt-notice">Your words stay in this browser. Drafts are separate from progress and are not included in progress exports. Don’t include private information. A passed keyword check does not guarantee a good AI answer.</p></div></div></div>;
}
