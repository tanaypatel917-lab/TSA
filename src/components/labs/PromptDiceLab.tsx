"use client";

import { useEffect, useRef, useState } from "react";
import {
  checkPrompt,
  diceAudiences,
  diceConstraints,
  diceMeterText,
  diceTasks,
  promptDiceChallenge,
  rollDice,
  type DiceRoll
} from "@/content/promptDice";
import { LabFrame } from "./LabFrame";

const initialRoll: DiceRoll = { task: 0, audience: 0, constraint: 0 };
const spec = "Model: none · Checks: 5 simple word rules · Runs on your device";

export function PromptDiceLab() {
  const [roll, setRoll] = useState<DiceRoll>(initialRoll);
  const [prompt, setPrompt] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [rolling, setRolling] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const challenge = promptDiceChallenge(roll);
  const checks = checkPrompt(prompt, roll);
  const passed = checks.filter(({ passed: isPassed }) => isPassed).length;
  const dice = [
    { id: "task", label: "TASK", text: diceTasks[roll.task].text },
    { id: "audience", label: "AUDIENCE", text: diceAudiences[roll.audience].text },
    { id: "constraint", label: "CONSTRAINT", text: diceConstraints[roll.constraint].text }
  ];
  const hoodRules = [
    { label: checks[0].label, words: diceTasks[roll.task].keywords.join(" / ") },
    { label: checks[1].label, words: diceAudiences[roll.audience].keywords.join(" / ") },
    { label: checks[2].label, words: diceConstraints[roll.constraint].keywords.join(" / ") },
    { label: checks[3].label, words: "act as / you are / as a" },
    { label: checks[4].label, words: "12 or more words" }
  ];

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function rollAgain() {
    const next = rollDice(roll);
    setRoll(next);
    setPrompt("");
    setAnnouncement(`New challenge: ${promptDiceChallenge(next)}`);
    setRolling(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRolling(false), 500);
  }

  return <LabFrame
    id="lab-dice"
    title="Roll a challenge. Write the prompt."
    note="A strong prompt names the task, who it's for and the limits. The dice make you practise with tasks you didn't choose."
    hood={{
      spec,
      content: <div className="prompt-dice-hood">
        <p>A real AI doesn&apos;t grade prompts like this. These rules only check that you named the parts:</p>
        <ul>{hoodRules.map(({ label, words }) => <li key={label}><strong>{label}</strong><span>{words}</span></li>)}</ul>
      </div>
    }}
  >
    <div className="prompt-dice-grid" data-rolling={rolling}>
      {dice.map(({ id, label, text }, index) => <div className="prompt-die" key={id}>
        <span className="prompt-die-label">{label}</span>
        <div className="prompt-die-cube" style={{ animationDelay: `${index * 55}ms` }}>
          <svg viewBox="0 0 200 160" aria-hidden="true" focusable="false">
            <polygon points="10,35 40,8 190,8 160,35" fill="#E9DCCB" stroke="var(--ink)" strokeWidth="2" />
            <polygon points="160,35 190,8 190,125 160,152" fill="#D9C8B5" stroke="var(--ink)" strokeWidth="2" />
            <polygon points="10,35 160,35 160,152 10,152" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
          </svg>
          <span className="prompt-die-face-text">{text}</span>
        </div>
      </div>)}
    </div>
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    <button type="button" className="button-primary lab-go" onClick={rollAgain}>Roll the dice</button>
    <p className="prompt-dice-challenge"><strong>Challenge:</strong> {challenge}</p>

    <label className="lab-field prompt-dice-field" htmlFor="prompt-dice-answer">
      <span>Your prompt</span>
      <textarea id="prompt-dice-answer" maxLength={400} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
    </label>
    <div className="prompt-dice-checks" aria-live="polite">
      <ul>{checks.map(({ id, label, passed: isPassed }) => <li key={id} data-passed={isPassed}>
        <span aria-hidden="true">{isPassed ? "✓" : "○"}</span>{label}
      </li>)}</ul>
      <div className="prompt-dice-meter-row">
        <div className="prompt-dice-meter" role="meter" aria-label="Prompt checks" aria-valuemin={0} aria-valuemax={5} aria-valuenow={passed}>
          <span style={{ width: `${passed * 20}%` }} />
        </div>
        <strong>{passed} of 5</strong>
      </div>
      <p className="prompt-dice-meter-copy">{diceMeterText(passed)}</p>
    </div>
  </LabFrame>;
}
