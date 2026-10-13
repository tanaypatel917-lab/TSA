"use client";

import { useEffect, useState } from "react";
import { useMotionPreference } from "./MotionPreferences";

const LINES: [tag: string, text: string][] = [
  ["$", "wordplay --boot"],
  ["[OK]", "vocabulary ....... 50,257 tokens"],
  ["[OK]", "next-word guesser  warmed up"],
  ["[OK]", "attention ........ reading every word"],
  ["[!!]", "facts.sys ........ not included"],
  ["    ", "check them yourself."],
  ["[OK]", "your progress .... stays on this device"],
  [">", "ready. Bring a question."]
];
const TOTAL = LINES.reduce((sum, [tag, text]) => sum + tag.length + 1 + text.length, 0);

export function BootLog() {
  const { reduced } = useMotionPreference();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduced) { setShown(TOTAL); return; }
    setShown(0);
    const timer = window.setInterval(() => setShown((count) => {
      if (count >= TOTAL) { window.clearInterval(timer); return count; }
      return count + 2;
    }), 22);
    return () => window.clearInterval(timer);
  }, [reduced]);

  let offset = 0;
  return <div className="boot-log" aria-hidden="true" data-done={shown >= TOTAL}>
    <div className="boot-log-bar"><i /><i /><i /><span>wordplay.model</span></div>
    <pre>{LINES.map(([tag, text], index) => {
      const full = `${tag} ${text}`;
      const visible = Math.max(0, Math.min(full.length, shown - offset));
      const typing = visible > 0 && visible < full.length;
      offset += full.length;
      if (!visible) return null;
      return <span key={index} className="boot-line" data-tag={tag.trim() || "more"}><b>{full.slice(0, Math.min(visible, tag.length))}</b>{full.slice(tag.length, visible)}{typing && <i className="boot-caret" />}{"\n"}</span>;
    })}{shown >= TOTAL && <i className="boot-caret" />}</pre>
  </div>;
}
