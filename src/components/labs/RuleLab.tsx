"use client";

import { useState } from "react";
import { ruleFlags } from "@/engine/labs";
import { LabFrame } from "./LabFrame";

const messages = [
  { text: "WIN a free phone now!!! Click this strange link.", spam: true },
  { text: "Urgent: claim your cash prize by sharing your password.", spam: true },
  { text: "Congratulations on winning the science fair!", spam: false },
  { text: "Your account is locked. Verify your details at this site.", spam: true },
  { text: "Can you send me the homework photo before class?", spam: false },
  { text: "Click here to see the free lunch menu for next week.", spam: false },
  { text: "Final notice: your reward expires tonight. Act fast.", spam: true },
  { text: "Reminder: soccer practice moved to 4:30 today.", spam: false }
];

export function RuleLab() {
  const [text, setText] = useState("win, prize, click, free");
  const keywords = text.split(",").map((word) => word.trim()).filter(Boolean);
  const results = messages.map((message) => ({ ...message, flagged: ruleFlags(message.text, keywords) }));
  const correct = results.filter((result) => result.flagged === result.spam).length;
  return <LabFrame id="lab-rules" title="Write a spam rule. Watch it break." note="Hand-written rules only catch the patterns someone predicted, and they misfire on innocent messages. Machine learning finds patterns from thousands of labeled examples instead, though it can learn the wrong pattern too.">
    <label className="lab-field"><span>Flag a message if it contains any of these words (separate with commas)</span><input type="text" value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} /></label>
    <p className="lab-score" aria-live="polite"><strong>{correct} of {messages.length}</strong> messages sorted correctly</p>
    <ul className="rule-list">
      {results.map((result) => {
        const ok = result.flagged === result.spam;
        return <li key={result.text} data-ok={ok}><span className="rule-text">{result.text}</span><span className="rule-verdict">{result.flagged ? "Flagged as spam" : "Let through"}<small>{ok ? "Right" : result.spam ? "Missed spam" : "False alarm"}</small></span></li>;
      })}
    </ul>
  </LabFrame>;
}
