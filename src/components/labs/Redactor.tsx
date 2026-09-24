"use client";

import { useState } from "react";
import { LabFrame } from "./LabFrame";

const pieces: { text: string; kind?: string }[] = [
  { text: "Hi, I’m " }, { text: "Maya Chen", kind: "Name" }, { text: " from " }, { text: "Lakeview High", kind: "School" },
  { text: ". Text me at " }, { text: "555-0142", kind: "Phone" }, { text: ". My friend " }, { text: "Jordan", kind: "Name" },
  { text: " has " }, { text: "asthma", kind: "Health" }, { text: " and can’t run the mile. Write an email to our coach at " },
  { text: "coach.r@example.org", kind: "Email" }, { text: " asking if " }, { text: "Jordan", kind: "Name" }, { text: " can do a different warm-up. We live on " }, { text: "Birch Street", kind: "Address" }, { text: "." }
];
const total = pieces.filter((piece) => piece.kind).length;

export function Redactor() {
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [sent, setSent] = useState(false);
  const removed = hidden.size;
  const toggle = (index: number) => { setSent(false); setHidden((current) => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next; }); };
  return <LabFrame id="lab-redact" title="Clean up a prompt before you send it." note="The request still works without the private details: the tool only needs a placeholder like [Name]. Health details about someone else need their permission even when a teacher is involved.">
    <p className="lab-hint">Click every personal detail to replace it with a placeholder.</p>
    <p className="redact-text">
      {pieces.map((piece, index) => piece.kind
        ? <button key={index} type="button" className="redact-chip" aria-pressed={hidden.has(index)} aria-label={hidden.has(index) ? `Restore ${piece.kind.toLowerCase()}` : `Hide ${piece.text}`} onClick={() => toggle(index)}>{hidden.has(index) ? `[${piece.kind}]` : piece.text}</button>
        : <span key={index}>{piece.text}</span>)}
    </p>
    <div className="redact-footer">
      <p className="lab-score" aria-live="polite"><strong>{removed} of {total}</strong> personal details removed</p>
      <button type="button" className="button-primary lab-go" onClick={() => setSent(true)}>Send to the chatbot</button>
    </div>
    {sent && <p className="redact-result" role="status" data-ok={removed === total}>{removed === total ? "Safe to send. The chatbot gets the request without anyone’s private information." : `Wait: ${total - removed} personal detail${total - removed === 1 ? " is" : "s are"} still in the prompt.`}</p>}
  </LabFrame>;
}
