"use client";

import Link from "next/link";
import { type CSSProperties, useState } from "react";
import "./hallucination-hunt.css";

type HuntCard = {
  id: string;
  name: string;
  path: string;
  href?: string;
};

const STARTING_CARDS: HuntCard[] = [
  { id: "explore", name: "Explore", path: "/modules", href: "/modules" },
  { id: "homework", name: "Homework answers", path: "/homework-answers" },
  { id: "glossary", name: "Glossary", path: "/glossary", href: "/glossary" },
  { id: "secret-level", name: "Secret level 99", path: "/secret-level-99" },
  { id: "badges", name: "Badges", path: "/badges", href: "/badges" },
  { id: "grade-book", name: "Teacher's grade book", path: "/grade-book" },
  { id: "timeline", name: "Timeline", path: "/timeline", href: "/timeline" },
  { id: "word-tray", name: "Word tray", path: "/tray", href: "/tray" },
];

const FAKE_IDS = new Set(["homework", "secret-level", "grade-book"]);
const CARD_TILTS = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.8];

export function HallucinationHunt() {
  const [cards, setCards] = useState(STARTING_CARDS);
  const [marked, setMarked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const falseAlarms = cards.filter((card) => card.href && marked.includes(card.id)).length;
  const caught = marked.filter((id) => FAKE_IDS.has(id)).length;
  const result = `You caught ${caught} of 3 fakes${
    falseAlarms === 0
      ? ", no false alarms"
      : `, ${falseAlarms} false alarm${falseAlarms === 1 ? "" : "s"}`
  }`;

  const toggleMarked = (id: string) => {
    setMarked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const playAgain = () => {
    const shuffled = [...STARTING_CARDS];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    setCards(shuffled);
    setMarked([]);
    setChecked(false);
  };

  return (
    <section className="hallucination-hunt" aria-labelledby="hallucination-hunt-title">
      <div className="hunt-intro">
        <p className="hunt-label">Mini-game</p>
        <h2 id="hallucination-hunt-title">
          This page doesn&apos;t exist. Neither do some of these.
        </h2>
        <p>
          An AI can invent a link that looks completely real. That&apos;s a hallucination.
          Mark the pages you think are made up, then check.
        </p>
      </div>

      <div className="hunt-grid">
        {cards.map((card, index) => {
          const isMarked = marked.includes(card.id);
          const isFake = FAKE_IDS.has(card.id);
          const wasCaught = checked && isFake && isMarked;
          const wasMissed = checked && isFake && !isMarked;
          const falseAlarm = checked && !isFake && isMarked;
          const isRealLink = checked && Boolean(card.href);
          const state = wasCaught ? "caught" : wasMissed ? "missed" : falseAlarm ? "false-alarm" : "";
          const className = `hunt-card${isMarked ? " is-marked" : ""}${isRealLink ? " is-real" : ""}${state ? ` is-${state}` : ""}`;
          const contents = (
            <>
              <span className="hunt-card-copy">
                <span className="hunt-card-name">{card.name}</span>
                <code className="hunt-card-path">{card.path}</code>
              </span>
              {isMarked && !checked && (
                <span className="hunt-stamp hunt-stamp--question" aria-hidden="true">
                  FAKE?
                </span>
              )}
              {wasCaught && (
                <span className="hunt-stamp hunt-stamp--caught" aria-hidden="true">
                  FAKE ✓
                </span>
              )}
              {wasMissed && <span className="hunt-tag">missed</span>}
              {falseAlarm && <span className="hunt-tag">real page</span>}
            </>
          );
          const style = {
            "--hunt-tilt": `${CARD_TILTS[index]}deg`,
          } as CSSProperties & { "--hunt-tilt": string };

          return (
            <div className="hunt-cell" key={card.id} style={style}>
              {!checked ? (
                <button
                  type="button"
                  className={className}
                  aria-pressed={isMarked}
                  onClick={() => toggleMarked(card.id)}
                >
                  {contents}
                </button>
              ) : card.href ? (
                <Link className={className} href={card.href}>
                  {contents}
                  <span className="hunt-card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              ) : (
                <div className={className}>{contents}</div>
              )}
            </div>
          );
        })}
      </div>

      {checked && (
        <p className="hunt-result" role="status">
          {result}
        </p>
      )}

      <div className="hunt-actions">
        {checked ? (
          <button type="button" className="button-primary" onClick={playAgain}>
            Play again
          </button>
        ) : (
          <button type="button" className="button-primary" onClick={() => setChecked(true)}>
            Check my answers
          </button>
        )}
      </div>
    </section>
  );
}
