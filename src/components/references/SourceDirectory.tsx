"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { formatCitation, referenceKinds, type ReferenceKind } from "@/content/references";
import type { ExplorerGroup, ExplorerReference, Focus } from "./ReferencesExplorer";

type KindFilter = ReferenceKind | "all";
const kinds = ["all", ...Object.keys(referenceKinds)] as KindFilter[];

export function SourceDirectory({ groups, pinned, pinnedSources, pinnedLabel, onClear, checkedOn }: { groups: ExplorerGroup[]; pinned: Focus; pinnedSources: string[] | null; pinnedLabel: string; onClear: () => void; checkedOn: string }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [copied, setCopied] = useState<{ id: string; ok: boolean } | null>(null);
  const [current, setCurrent] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const all = groups.flatMap((group) => group.references);
  const search = query.trim().toLowerCase();
  const matches = (reference: ExplorerReference) => (kind === "all" || reference.kind === kind)
    && (!pinnedSources || pinnedSources.includes(reference.id))
    && (!search || [reference.title, reference.authors, reference.publisher, reference.short, reference.note, reference.source ?? ""].some((text) => text.toLowerCase().includes(search)));
  const visible = all.filter(matches);
  const filterKey = `${kind}|${search}|${pinnedSources?.join() ?? ""}`;
  const copiedReference = copied && all.find((reference) => reference.id === copied.id);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    const sections = list.current?.querySelectorAll<HTMLElement>(".reference-group");
    if (!sections?.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const hit = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (hit) setCurrent(hit.target.id);
    }, { rootMargin: "-18% 0px -72% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [filterKey]);

  async function copy(reference: ExplorerReference) {
    try {
      await navigator.clipboard.writeText(formatCitation(reference));
      setCopied({ id: reference.id, ok: true });
    } catch {
      setCopied({ id: reference.id, ok: false });
    }
  }
  function reset() { setQuery(""); setKind("all"); onClear(); }
  function print() { flushSync(reset); window.print(); }

  const status = visible.length === all.length ? `All ${all.length} sources` : `Showing ${visible.length} of ${all.length} sources${pinned ? `, for ${pinnedLabel}` : ""}`;
  return <section id="source-directory" className="shell source-directory" aria-labelledby="directory-title"><aside className="directory-tools"><h2 id="directory-title">Every source, numbered.</h2><p className="directory-note">APA 7th edition. Links checked {checkedOn}.</p><label htmlFor="source-search" className="directory-label">Search sources</label><input id="source-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try UNESCO or bias" autoComplete="off" aria-describedby="directory-count" /><fieldset className="choice-group"><legend className="choice-legend">Type</legend><div className="choice-options">{kinds.map((value) => <label key={value} className="choice"><input type="radio" name="source-kind" value={value} checked={kind === value} onChange={() => setKind(value)} className="sr-only" /><span>{value === "all" ? "All" : referenceKinds[value]}<b>{value === "all" ? all.length : all.filter((reference) => reference.kind === value).length}</b></span></label>)}</div></fieldset>{pinned && <div className="focus-chip"><span>{pinned.type === "lesson" ? "Lesson" : "Source"}</span><strong>{pinnedLabel}</strong><button type="button" onClick={onClear} aria-label={`Stop filtering by ${pinnedLabel}`}>×</button></div>}<p id="directory-count" className="directory-count" role="status">{status}</p><nav className="directory-nav" aria-label="Reference sections"><ol>{groups.map((group) => {
    const count = group.references.filter(matches).length;
    return <li key={group.id}>{count ? <a href={`#references-${group.id}`} aria-current={current === `references-${group.id}` ? "location" : undefined}>{group.title}<span>{count}</span></a> : <span className="directory-nav-empty">{group.title}<span>0</span></span>}</li>;
  })}<li><a href="#references-credits">Typefaces, 3D, and software</a></li></ol></nav><button type="button" className="button-secondary directory-print" onClick={print}>Print references</button></aside><div className="directory-list" ref={list}>{groups.map((group) => {
    const items = group.references.filter(matches);
    if (!items.length) return null;
    return <section key={group.id} id={`references-${group.id}`} className="reference-group" aria-labelledby={`references-${group.id}-title`}><h3 id={`references-${group.id}-title`}>{group.title}</h3><p>{group.description}</p><ol className="reference-list">{items.map((reference) => {
      const state = copied?.id === reference.id ? (copied.ok ? "copied" : "failed") : undefined;
      return <li key={reference.id} id={`ref-${reference.id}`} className="reference-item" data-highlight={pinned?.type === "source" && pinned.key === reference.id}><span className="reference-number" aria-hidden="true">{String(reference.number).padStart(2, "0")}</span><div className="reference-body"><p className="reference-meta"><span className="reference-kind" data-kind={reference.kind}>{referenceKinds[reference.kind]}</span><span>{reference.publisher}</span></p><h4 className="reference-title"><a href={reference.url} rel="noreferrer">{reference.title}<span aria-hidden="true"> ↗</span></a></h4><p className="reference-citation">{reference.authors} ({reference.date}). <cite>{reference.title}</cite>.{reference.source && ` ${reference.source}.`} <span className="reference-url">{reference.url}</span></p><p className="reference-note">{reference.note}{reference.used.length > 0 && <> Used in {reference.used.map((lesson, index) => <Fragment key={lesson.href}>{index > 0 && (index === reference.used.length - 1 ? " and " : ", ")}<Link href={lesson.href}>{lesson.title}</Link></Fragment>)}.</>}</p><button type="button" className="copy-citation" data-state={state} onClick={() => copy(reference)}>{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy citation"}<span className="sr-only"> for {reference.short}</span></button></div></li>;
    })}</ol></section>;
  })}{!visible.length && <div className="directory-empty"><p>No sources match{search ? ` “${query.trim()}”` : " these filters"}.</p><button type="button" className="button-secondary" onClick={reset}>Clear filters</button></div>}<p className="sr-only" role="status">{copied ? copied.ok ? `Citation copied for ${copiedReference?.short}.` : "Copy failed. Select the citation text and copy it instead." : ""}</p></div></section>;
}
