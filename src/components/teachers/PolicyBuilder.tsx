"use client";

import { useEffect, useState } from "react";
import { policyOptions } from "@/content/toolkit";
import { printSection } from "../print";

const KEY = "wordplay:policy-draft";
type Draft = { className: string; allowed: string[]; notAllowed: string[]; disclosure: string; ask: string };
const blank: Draft = { className: "", allowed: policyOptions.allowed.slice(0, 3), notAllowed: policyOptions.notAllowed.slice(0, 3), disclosure: policyOptions.disclosure, ask: "Ask me before you use AI if you are not sure." };

export function PolicyBuilder() {
  const [draft, setDraft] = useState<Draft>(blank);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const saved = sessionStorage.getItem(KEY); if (saved) setDraft({ ...blank, ...JSON.parse(saved) }); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { sessionStorage.setItem(KEY, JSON.stringify(draft)); } catch {} }, [draft, ready]);
  const toggle = (field: "allowed" | "notAllowed", item: string) => setDraft((current) => ({ ...current, [field]: current[field].includes(item) ? current[field].filter((value) => value !== item) : [...current[field], item] }));
  const title = draft.className.trim() ? `AI use in ${draft.className.trim()}` : "AI use in our class";
  const preview = <>
    <h3>{title}</h3>
    <h4>You may use AI for</h4><ul>{draft.allowed.map((item) => <li key={item}>{item}</li>)}</ul>
    <h4>Do not use AI for</h4><ul>{draft.notAllowed.map((item) => <li key={item}>{item}</li>)}</ul>
    <h4>When you use AI, add a note</h4><p className="policy-quote">{draft.disclosure}</p>
    <p>{draft.ask}</p>
  </>;
  return <div className="policy">
    <form className="policy-form" onSubmit={(event) => event.preventDefault()}>
      <label className="policy-field"><span>Class name</span><input type="text" value={draft.className} maxLength={60} placeholder="Period 3 Biology" onChange={(event) => setDraft({ ...draft, className: event.target.value })} /></label>
      <fieldset><legend>Students may use AI for</legend>{policyOptions.allowed.map((item) => <label key={item} className="policy-check"><input type="checkbox" checked={draft.allowed.includes(item)} onChange={() => toggle("allowed", item)} /> {item}</label>)}</fieldset>
      <fieldset><legend>Students may not use AI for</legend>{policyOptions.notAllowed.map((item) => <label key={item} className="policy-check"><input type="checkbox" checked={draft.notAllowed.includes(item)} onChange={() => toggle("notAllowed", item)} /> {item}</label>)}</fieldset>
      <label className="policy-field"><span>Disclosure note</span><textarea rows={2} value={draft.disclosure} onChange={(event) => setDraft({ ...draft, disclosure: event.target.value })} /></label>
      <label className="policy-field"><span>When in doubt</span><input type="text" value={draft.ask} onChange={(event) => setDraft({ ...draft, ask: event.target.value })} /></label>
    </form>
    <div className="policy-side">
      <div className="policy-preview" aria-live="polite">{preview}</div>
      <div className="policy-actions"><button type="button" className="button-primary" onClick={() => printSection("policy")}>Print policy</button><button type="button" className="plan-print" onClick={() => setDraft(blank)}>Reset</button></div>
      <p className="checker-privacy">Kept only in this browser tab until you close it.</p>
    </div>
    <div className="print-only" aria-hidden="true"><div data-print-id="policy"><article className="print-sheet"><header><span>Wordplay · Hands-on AI literacy</span><span>Classroom AI policy</span></header>{preview}<footer>Built with the Wordplay teacher toolkit.</footer></article></div></div>
  </div>;
}
