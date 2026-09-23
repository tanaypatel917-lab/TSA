"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { termSlug, type TermLesson } from "@/engine/glossary";
import { GlossaryStudy } from "./GlossaryStudy";

type Entry = { term: string; definition: string; lessons: TermLesson[] };
type Mode = "browse" | "study";

const initial = (term: string) => term[0].toUpperCase();

export function GlossaryExplorer({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("browse");
  const search = query.trim().toLowerCase();
  const visible = entries.filter((entry) => !search || entry.term.toLowerCase().includes(search) || entry.definition.toLowerCase().includes(search));
  const groups = [...new Set(visible.map((entry) => initial(entry.term)))].sort().map((letter) => [letter, visible.filter((entry) => initial(entry.term) === letter).sort((a, b) => a.term.localeCompare(b.term))] as const);
  const letters = [...new Set(entries.map((entry) => initial(entry.term)))].sort();
  const shown = new Set(groups.map(([letter]) => letter));
  return <div className="shell glossary-layout"><aside className="glossary-tools"><fieldset className="choice-group glossary-mode"><legend className="choice-legend">Mode</legend><div className="choice-options">{(["browse", "study"] as const).map((value) => <label key={value} className="choice"><input type="radio" name="glossary-mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="sr-only" /><span>{value === "browse" ? "Browse" : "Study cards"}</span></label>)}</div></fieldset><label htmlFor="glossary-search">Search the glossary</label><input id="glossary-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try token or bias" aria-describedby="glossary-count" autoComplete="off" /><p id="glossary-count" className="glossary-count" role="status">{visible.length === entries.length ? `${entries.length} terms` : `${visible.length} of ${entries.length} terms`}</p>{mode === "browse" && <nav className="glossary-letters" aria-label="Jump to a letter">{letters.map((letter) => shown.has(letter) ? <a key={letter} href={`#glossary-${letter}`}>{letter}</a> : <span key={letter} aria-hidden="true">{letter}</span>)}</nav>}</aside><div className="glossary-list">{mode === "study" ? <GlossaryStudy key={visible.map((entry) => entry.term).join("|")} cards={visible} /> : groups.length ? groups.map(([letter, items], order) => <section key={letter} id={`glossary-${letter}`} className="glossary-group" aria-labelledby={`glossary-heading-${letter}`} data-reveal={order % 3}><h2 id={`glossary-heading-${letter}`}>{letter}</h2><dl>{items.map((item) => <div key={item.term} id={`term-${termSlug(item.term)}`} className="glossary-entry"><dt>{item.term}</dt><dd><p>{item.definition}</p>{item.lessons.length > 0 && <p className="glossary-seen">Explained in {item.lessons.map((lesson, index) => <Fragment key={lesson.href}>{index > 0 && " and "}<Link href={lesson.href}>{lesson.title}</Link></Fragment>)}</p>}</dd></div>)}</dl></section>) : <div className="glossary-empty"><p>No terms match “{query.trim()}”.</p><button className="button-secondary" onClick={() => setQuery("")}>Clear search</button></div>}</div></div>;
}
