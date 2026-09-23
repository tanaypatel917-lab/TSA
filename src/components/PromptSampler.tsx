"use client";

import Link from "next/link";
import { useState } from "react";
import type { Activity } from "@/content/types";
import { evaluatePrompt } from "@/engine/prompt";

export function PromptSampler({ activity, href }: { activity: Extract<Activity, { kind: "prompt-lab" }>; href: string }) {
  const [text, setText] = useState("");
  const { checks, score } = evaluatePrompt(text, activity.rubric);
  return <section className="shell home-sampler" aria-labelledby="sampler-title"><div className="sampler-intro"><p className="section-index">A little practice</p><h2 id="sampler-title">Better words.<br />Better starting point.</h2><p>A useful prompt gives an AI tool something to work with. Try adding a role, a task, and a little context.</p><Link href={href} className="text-link">Open the full Prompt Lab <span aria-hidden="true">↗</span></Link></div><div className="sampler-workspace"><p className="weak-label">Start with a vague prompt</p><blockquote>{activity.weakPrompt}</blockquote><label htmlFor="prompt-sampler">Make it more specific</label><textarea id="prompt-sampler" rows={4} maxLength={20000} value={text} onChange={(event) => setText(event.target.value)} placeholder="Act as a science teacher. Explain…" /><ul className="rubric-list rubric-compact">{checks.map((rule) => <li key={rule.id} data-passed={rule.ok}><strong>{rule.label}</strong><span>{rule.ok ? "Passed" : "Missing"}</span></li>)}</ul><p className="sampler-status" aria-live="polite">{score} of {checks.length} rubric terms found</p><p className="small-note">A local keyword check, not an AI evaluation. This sampler does not save text or award progress.</p></div></section>;
}
