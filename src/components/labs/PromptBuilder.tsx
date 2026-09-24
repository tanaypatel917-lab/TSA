"use client";

import { useState } from "react";
import { LabFrame } from "./LabFrame";

const parts = [
  { id: "role", label: "Role", text: "Act as a patient biology tutor." },
  { id: "task", label: "Task", text: "Explain photosynthesis.", locked: true },
  { id: "context", label: "Context", text: "I’m in 9th grade and I mix up the light and dark reactions." },
  { id: "format", label: "Format", text: "Use three bullet points." },
  { id: "limits", label: "Limits", text: "Keep it under 70 words and end with one question to check my understanding." }
] as const;

type PartId = (typeof parts)[number]["id"];

function answer(on: Set<PartId>) {
  const focus = on.has("context");
  const lines = focus
    ? ["Light reactions happen in the thylakoids: sunlight splits water and makes ATP and NADPH.", "The Calvin cycle (the “dark” reactions) happens in the stroma and uses that ATP and NADPH to turn CO₂ into sugar.", "Remember it as: light charges the battery, the Calvin cycle spends it."]
    : ["Photosynthesis is the process plants, algae and some bacteria use to turn light energy into chemical energy.", "It takes in carbon dioxide and water and releases oxygen, producing glucose.", "It happens in chloroplasts and has two main stages, and it supports almost all life on Earth by producing oxygen and food."];
  const opener = on.has("role") ? "Great question, let’s take it step by step." : "";
  const body = on.has("format") ? lines.map((line) => `• ${line}`).join("\n") : lines.join(" ");
  const trimmed = on.has("limits") ? body.split(on.has("format") ? "\n" : ". ").slice(0, on.has("format") ? 3 : 2).join(on.has("format") ? "\n" : ". ") : on.has("format") ? body : `${body} Scientists also study how photosynthesis responds to temperature and light intensity, and it is the basis for most food chains.`;
  const check = on.has("limits") ? "\nQuick check: which stage uses the ATP, and where does it happen?" : "";
  return [opener, trimmed + check].filter(Boolean).join("\n");
}

export function PromptBuilder() {
  const [on, setOn] = useState<Set<PartId>>(new Set(["task"]));
  const toggle = (id: PartId) => setOn((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const count = on.size;
  return <LabFrame id="lab-prompt" title="Build a prompt one part at a time." note="The responses are written examples of what a real tool tends to return, so you can compare them side by side. Real outputs vary, so treat every answer as a draft to check.">
    <div className="lab-choices" role="group" aria-label="Prompt parts">
      {parts.map((part) => <button key={part.id} type="button" aria-pressed={on.has(part.id)} disabled={"locked" in part} onClick={() => toggle(part.id)} data-part={part.id}>{part.label}</button>)}
    </div>
    <div className="prompt-compare">
      <div className="prompt-box"><span className="node-label">Your prompt · {count} of {parts.length} parts</span><p>{parts.filter((part) => on.has(part.id)).map((part) => <span key={part.id} className="prompt-part" data-part={part.id}>{part.text} </span>)}</p></div>
      <div className="prompt-box is-answer" aria-live="polite"><span className="node-label">A likely response</span><p>{answer(on)}</p></div>
    </div>
    <p className="prompt-meter"><span className="meter-track"><i style={{ width: `${(count / parts.length) * 100}%` }} /></span>{count <= 2 ? "Vague: the tool has to guess what you need." : count <= 4 ? "Better: the answer is aimed at you." : "Specific: focused, checkable and the right length."}</p>
  </LabFrame>;
}
