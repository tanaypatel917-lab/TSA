"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LAUNCH_INTRO, LAUNCH_NODES } from "@/content/launchDay";
import { launchEnding } from "@/engine/launchDay";
import { LabFrame } from "./LabFrame";

const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu"];

export function LaunchDayLab() {
  const [day, setDay] = useState(0);
  const [path, setPath] = useState<number[]>([]);
  const cardHeading = useRef<HTMLHeadingElement>(null);
  const focusNextCard = useRef(false);
  const trust = path.reduce((total, choiceIndex, nodeIndex) => total + LAUNCH_NODES[nodeIndex].choices[choiceIndex].trust, 0);
  const node = LAUNCH_NODES[day];
  const selectedChoice = path[day];
  const ending = path.length === LAUNCH_NODES.length ? launchEnding(trust) : null;
  const meterStart = trust < 0 ? ((trust + 8) / 12) * 100 : (8 / 12) * 100;
  const meterWidth = (Math.abs(trust) / 12) * 100;

  useEffect(() => {
    if (!focusNextCard.current) return;
    cardHeading.current?.focus();
    focusNextCard.current = false;
  }, [day]);

  function choose(choiceIndex: number) {
    if (selectedChoice !== undefined) return;
    setPath((current) => current.length === day ? [...current, choiceIndex] : current);
  }

  function nextDay() {
    focusNextCard.current = true;
    setDay((current) => current + 1);
  }

  function tryAgain() {
    focusNextCard.current = true;
    setPath([]);
    setDay(0);
  }

  return <LabFrame
    id="lab-launch-day"
    title="Launch day: four choices before the club fair."
    note={LAUNCH_INTRO}
  >
    <div className="launch-day-topline">
      <div className="launch-path" role="img" aria-label={`Four-day launch path. ${path.length} of 4 decisions made.`}>
        <svg className="launch-path-svg" viewBox="0 0 400 52" preserveAspectRatio="none" aria-hidden="true">
          {path.slice(1).map((choiceIndex, index) => {
            const previousY = path[index] === 0 ? 13 : 39;
            const currentY = choiceIndex === 0 ? 13 : 39;
            return <line key={index} className="launch-path-line" x1={50 + index * 100} y1={previousY} x2={150 + index * 100} y2={currentY} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        <div className="launch-path-days">
          {LAUNCH_NODES.map((item, index) => {
            const topic = item.tag.split(" · ")[1];
            return <div className="launch-path-day" key={item.id}>
              <span className="launch-path-tag launch-path-tag--long">{item.tag}</span>
              <span className="launch-path-tag launch-path-tag--short">{SHORT_DAYS[index]} · {topic}</span>
              {item.choices.map((_, choiceIndex) => <span
                key={`${item.id}-${choiceIndex}`}
                className={`launch-path-dot launch-path-dot--${choiceIndex}`}
                data-picked={path[index] === choiceIndex}
                aria-hidden="true"
              />)}
            </div>;
          })}
        </div>
      </div>
      <div className="launch-trust">
        <div className="launch-trust-heading"><span>Trust</span><strong>{trust > 0 ? `+${trust}` : trust}</strong></div>
        <div
          className="launch-meter"
          role="meter"
          aria-label="Trust"
          aria-valuemin={-8}
          aria-valuemax={4}
          aria-valuenow={trust}
          aria-valuetext={`Trust ${trust}`}
        >
          <div className="launch-meter-track">
            <span className="launch-meter-zero" aria-hidden="true" />
            {trust !== 0 && <span className={`launch-meter-fill${trust < 0 ? " is-negative" : ""}`} style={{ left: `${meterStart}%`, width: `${meterWidth}%` }} />}
          </div>
          <div className="launch-meter-labels" aria-hidden="true"><span>-8</span><span>0</span><span>+4</span></div>
        </div>
      </div>
    </div>

    <p className="launch-status" role="status">
      {ending ? `${ending.title} · Trust ${trust}` : `Day ${day + 1} of 4 · Trust ${trust}`}
    </p>

    {ending ? <section className="launch-ending-wrap" aria-labelledby="launch-ending-title">
      <div className="launch-ending" data-ending={ending.id}>
        <div className="launch-ending-copy">
          <p className="launch-ending-kicker">Launch decision</p>
          <h4 id="launch-ending-title">{ending.title}</h4>
          <p>{ending.text}</p>
        </div>
        <span className="launch-ending-stamp" aria-hidden="true">{ending.id === "trusted" ? "TRUSTED" : ending.id === "patched" ? "PATCHED" : "PULLED"}</span>
      </div>
      <section className="launch-your-path" aria-labelledby="launch-your-path-title">
        <h4 id="launch-your-path-title">Your path</h4>
        <ol className="launch-review-list">
          {LAUNCH_NODES.map((item, index) => {
            const choice = item.choices[path[index]];
            return <li className="launch-review-row" key={item.id}>
              <span className="launch-review-day">{item.tag}</span>
              <span className="launch-review-choice">{choice.label}</span>
              <span className="launch-review-feedback" data-good={choice.trust === 1}>
                <strong>{choice.trust === 1 ? "✓ +1" : "! −2"}</strong>
                {choice.feedback}
              </span>
            </li>;
          })}
        </ol>
      </section>
      <div className="launch-ending-actions">
        <button className="button-secondary" type="button" onClick={tryAgain}>Try another path</button>
        <Link className="text-link text-link--arrow" href="/modules/capstone/activity/"><span className="text-link-label">Write your own plan </span><span aria-hidden="true">↗</span></Link>
      </div>
    </section> : <section className="launch-day-card" key={node.id} aria-labelledby="launch-day-heading">
      <div className="launch-day-card-head">
        <p>Decision {day + 1} <span>of 4</span></p>
        <h4 id="launch-day-heading" ref={cardHeading} tabIndex={-1}>{node.tag}</h4>
      </div>
      <p className="launch-situation">{node.situation}</p>
      {selectedChoice === undefined ? <div className="launch-day-choices" role="group" aria-label={`Choices for ${node.tag}`}>
        {node.choices.map((choice, index) => <button
          className="launch-day-choice"
          data-trust={choice.trust === 1 ? "good" : "bad"}
          type="button"
          key={choice.label}
          onClick={() => choose(index)}
        >
          <span className="launch-choice-mark" aria-hidden="true">{index === 0 ? "A" : "B"}</span>
          <span className="launch-choice-label">{choice.label}</span>
          <span className="launch-choice-score">{choice.trust === 1 ? "+1 trust" : "−2 trust"}</span>
        </button>)}
      </div> : <div className="launch-feedback" data-good={node.choices[selectedChoice].trust === 1}>
        <span className="launch-feedback-stamp">{node.choices[selectedChoice].trust === 1 ? "✓ +1" : "! −2"}</span>
        <p>{node.choices[selectedChoice].feedback}</p>
        {day < LAUNCH_NODES.length - 1 && <button className="button-primary launch-next-day" type="button" onClick={nextDay}>Next day →</button>}
      </div>}
    </section>}
  </LabFrame>;
}
