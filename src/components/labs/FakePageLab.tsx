"use client";

import { useEffect, useRef, useState } from "react";
import { fakePageClues, fakePageCopy, shouldRevealFakePage, type FakePageClueId } from "@/content/fakePage";
import { LabFrame } from "./LabFrame";

function ClueButton({ id, number, found, onFind, className = "", children }: {
  id: FakePageClueId;
  number: number;
  found: boolean;
  onFind: (id: FakePageClueId) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return <button
    type="button"
    className={`fakepage-clue ${className}`}
    data-clue-id={id}
    data-found={found}
    aria-pressed={found}
    onClick={() => onFind(id)}
  >
    {children}
    {found && <span className="fakepage-clue-sticker" aria-hidden="true">{number}</span>}
  </button>;
}

export function FakePageLab() {
  const [found, setFound] = useState<Set<FakePageClueId>>(() => new Set());
  const [manualReveal, setManualReveal] = useState(false);
  const revealHeading = useRef<HTMLHeadingElement>(null);
  const revealed = manualReveal || shouldRevealFakePage(found.size);
  const foundNotes = fakePageClues.filter((clue) => found.has(clue.id));

  useEffect(() => {
    if (revealed) revealHeading.current?.focus();
  }, [revealed]);

  function findClue(id: FakePageClueId) {
    setFound((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }

  function startAgain() {
    setFound(new Set());
    setManualReveal(false);
  }

  const hoodContent = <>
    <p>{fakePageCopy.hoodIntro}</p>
    <ul className="fakepage-hood-list">{fakePageClues.map((clue) => <li key={clue.id}>{clue.name}</li>)}</ul>
  </>;

  return <LabFrame
    id="fakepage-lab"
    title={fakePageCopy.title}
    note={fakePageCopy.figcaption}
    hood={{ spec: fakePageCopy.hoodSpec, content: hoodContent }}
  >
    <p className="fakepage-instruction">{fakePageCopy.instruction}</p>
    <p className="fakepage-counter" role="status" aria-live="polite" aria-atomic="true">{found.size} of 5 clues found</p>
    <div className="fakepage-workbench">
      <section className="fakepage-browser" aria-label="Mock news page">
        <div className="fakepage-browser-bar">
          <div className="fakepage-browser-dots" aria-hidden="true"><i /><i /><i /></div>
          <div className="fakepage-address">
            <ClueButton id="address" number={1} found={found.has("address")} onFind={findClue} className="fakepage-address-clue">
              {fakePageCopy.address}
            </ClueButton>
          </div>
        </div>
        <article className="fakepage-paper" data-revealed={revealed}>
          <p className="fakepage-section">{fakePageCopy.section}</p>
          <h4 className="fakepage-headline">
            {fakePageCopy.headlineStart}
            <ClueButton id="statistic" number={3} found={found.has("statistic")} onFind={findClue}>
              {fakePageCopy.statistic}
            </ClueButton>
            {fakePageCopy.headlineEnd}
          </h4>
          <p className="fakepage-byline">
            By{" "}
            <ClueButton id="byline" number={2} found={found.has("byline")} onFind={findClue}>
              {fakePageCopy.bylineName}
            </ClueButton>
            {fakePageCopy.bylineDetails}
          </p>
          <div className="fakepage-art">
            <svg viewBox="0 0 520 190" role="img" aria-label="A closed laptop on a desk with a sleeping question mark">
              <rect x="36" y="142" width="448" height="24" rx="5" fill="var(--clay)" />
              <path d="M58 166h404l24 13H34z" fill="var(--ink)" />
              <rect x="185" y="58" width="150" height="81" rx="9" fill="var(--sky)" stroke="var(--ink)" strokeWidth="4" />
              <path d="M166 139h188l20 14H146z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
              <text x="260" y="116" textAnchor="middle" fill="var(--ink)" fontFamily="Georgia, serif" fontSize="62" fontWeight="700">?</text>
              <text x="359" y="76" fill="var(--clay)" fontFamily="Georgia, serif" fontSize="24" fontWeight="700">z</text>
              <text x="382" y="54" fill="var(--clay)" fontFamily="Georgia, serif" fontSize="30" fontWeight="700">z</text>
            </svg>
            <p className="fakepage-art-caption">{fakePageCopy.imageCaption}</p>
          </div>
          <p className="fakepage-paragraph">{fakePageCopy.paragraphOne}</p>
          <p className="fakepage-paragraph">
            “<ClueButton id="quote" number={4} found={found.has("quote")} onFind={findClue}>
              {fakePageCopy.quote}
            </ClueButton>,”{fakePageCopy.quoteAfter}
          </p>
          <p className="fakepage-share">
            {fakePageCopy.shareStart}
            <ClueButton id="shares" number={5} found={found.has("shares")} onFind={findClue}>
              {fakePageCopy.shareCount}
            </ClueButton>
          </p>
          {revealed && <span className="fakepage-stamp">{fakePageCopy.stamp}</span>}
        </article>
      </section>
      <aside className="fakepage-clues-found" aria-labelledby="fakepage-clues-heading">
        <h4 id="fakepage-clues-heading">{fakePageCopy.cluesFoundHeading}</h4>
        {foundNotes.length > 0
          ? <ul>{foundNotes.map((clue) => <li className="fakepage-clue-note" key={clue.id}>
            <span className="fakepage-clue-note-label">{clue.name}</span>
            <p>{clue.note}</p>
          </li>)}</ul>
          : <p className="fakepage-empty-clues">{fakePageCopy.emptyClues}</p>}
      </aside>
    </div>
    <button type="button" className="button-secondary fakepage-reveal-button" onClick={() => setManualReveal(true)}>
      {fakePageCopy.revealButton}
    </button>
    {revealed && <section className="fakepage-reveal" aria-labelledby="fakepage-reveal-heading">
      <h4 id="fakepage-reveal-heading" ref={revealHeading} tabIndex={-1}>{fakePageCopy.revealHeading}</h4>
      <p>{fakePageCopy.revealParagraph}</p>
      <h5>{fakePageCopy.reviewHeading}</h5>
      <ul className="fakepage-review-list">
        {fakePageClues.map((clue) => {
          const wasFound = found.has(clue.id);
          return <li key={clue.id} data-state={wasFound ? "found" : "missed"}>
            <strong>{wasFound ? "Found" : "Missed"}</strong>
            <span>{clue.name}</span>
          </li>;
        })}
      </ul>
      <h5>{fakePageCopy.checksHeading}</h5>
      <ol className="fakepage-check-list">{fakePageCopy.checks.map((check) => <li key={check}>{check}</li>)}</ol>
      <button type="button" className="button-secondary fakepage-retry" onClick={startAgain}>{fakePageCopy.retryButton}</button>
    </section>}
  </LabFrame>;
}
