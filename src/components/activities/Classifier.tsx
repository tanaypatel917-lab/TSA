"use client";
import { useEffect, useRef, useState } from "react";
import type { Activity } from "@/content/types";
import { markClues, tallyClues, type Label } from "@/engine/clues";
import { useProgress } from "@/state/ProgressProvider";
import { todayKey } from "@/engine/dates";

const bins = [{ label: "spam", name: "Spam", hint: "Pushy, too good to be true, or asks for secrets." }, { label: "not-spam", name: "Not spam", hint: "Ordinary news from people and places you know." }] as const;

export function Classifier({ activity, moduleId }: { activity: Extract<Activity, { kind: "classifier" }>; moduleId: string }) {
  const { dispatch } = useProgress();
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [choice, setChoice] = useState<Label | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const result = useRef<HTMLHeadingElement>(null);
  const item = activity.items[index];
  const total = activity.items.length;
  const clues = activity.clues ?? [];
  useEffect(() => { if (done) result.current?.focus(); }, [done]);
  function answer(label: Label) {
    if (choice || done) return;
    const nextCorrect = correct + (label === item.label ? 1 : 0);
    setCorrect(nextCorrect);
    setChoice(label);
    setLabels((list) => [...list, label]);
    if (index === total - 1) {
      setDone(true);
      dispatch({ type: "activity-completed", moduleId, day: todayKey() });
    } else {
      window.setTimeout(() => { setIndex((value) => value + 1); setChoice(null); }, clues.length ? 900 : 500);
    }
  }
  function restart() { setIndex(0); setCorrect(0); setChoice(null); setLabels([]); setDone(false); }
  if (done) {
    const tally = tallyClues(activity.items, labels, clues);
    return <div className="activity-result"><p className="section-index">Sorting complete</p><h2 ref={result} tabIndex={-1}>{correct} of {total} sorted correctly.</h2><p>{correct === total ? "Every message landed in the right place." : "Look back at the ones that fooled you. Which clue pointed the wrong way?"} A real classifier needs thousands of labeled examples, and careful testing on messages it has never seen.</p>{tally.length > 0 && <div className="clue-report"><h3>What your labels taught the model</h3><table><caption className="sr-only">How many messages with each clue you labeled spam or not spam</caption><thead><tr><th scope="col">Clue</th><th scope="col">You said spam</th><th scope="col">You said not spam</th></tr></thead><tbody>{tally.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td><span className="clue-count" data-kind="spam" style={{ "--n": row.spam } as React.CSSProperties}>{row.spam}</span></td><td><span className="clue-count" data-kind="not-spam" style={{ "--n": row.notSpam } as React.CSSProperties}>{row.notSpam}</span></td></tr>)}</tbody></table><p className="small-note">A model trained on your labels would treat these clues as evidence. Real spam filters learn thousands of them from millions of messages, so one mislabeled example matters less, but a biased set of examples matters a lot.</p></div>}<button className="button-secondary" onClick={restart}>Sort again</button></div>;
  }
  return <div className="sorting-desk"><div className="activity-progress"><p>Message {index + 1} of {total}</p><p>{correct} correct so far</p><div className="activity-steps" aria-hidden="true">{activity.items.map((entry, position) => <i key={entry.text} data-reached={position <= index} />)}</div></div><blockquote key={index} className="sorting-message" data-sent={choice ?? undefined}>{choice ? markClues(item.text, clues).map((part, position) => part.clue ? <mark key={position}>{part.text}</mark> : part.text) : item.text}</blockquote><div className="sorting-bins" role="group" aria-label="Label this message">{bins.map((bin) => <button key={bin.label} className="sorting-bin" data-state={choice === bin.label ? (bin.label === item.label ? "correct" : "incorrect") : undefined} aria-pressed={choice === bin.label} aria-disabled={!!choice} onClick={() => answer(bin.label)}><strong>{bin.name}</strong><span>{bin.hint}</span></button>)}</div><p className="activity-feedback" role="status">{choice ? `${choice === item.label ? "Correct. Nice pattern spotting." : `Not quite. This one is ${item.label === "spam" ? "spam" : "not spam"}.`}${clues.length && markClues(item.text, clues).some((part) => part.clue) ? " Highlighted words are clues a filter could learn." : ""}` : ""}</p></div>;
}
