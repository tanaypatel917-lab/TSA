"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { titleGuess } from "@/content/titleGuess";
import { useMotionPreference } from "./MotionPreferences";

const word = titleGuess.map(({ letter }) => letter).join("");
const blankTiles = () => titleGuess.map(() => "_");

export function TitleGuess() {
  const { reduced, ready } = useMotionPreference();
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const animationStarted = useRef(false);
  const [letters, setLetters] = useState(blankTiles);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [optionIndex, setOptionIndex] = useState(1);
  const [finished, setFinished] = useState(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const replay = useCallback(() => {
    clearTimers();
    animationStarted.current = true;
    setLetters(blankTiles());
    setFinished(false);

    const showSlot = (index: number) => {
      if (index === titleGuess.length) {
        setActiveIndex(null);
        setFinished(true);
        return;
      }

      const slot = titleGuess[index];
      setActiveIndex(index);
      setCurrentIndex(index);
      setOptionIndex(1);
      setLetters((current) => current.map((letter, position) => position === index ? slot.candidates[1][0] : letter));

      const showCandidate = (candidateIndex: number) => {
        setOptionIndex(candidateIndex);
        setLetters((current) => current.map((letter, position) => position === index ? slot.candidates[candidateIndex][0] : letter));
      };

      timers.current.push(window.setTimeout(() => showCandidate(2), 125));
      timers.current.push(window.setTimeout(() => showCandidate(1), 250));
      timers.current.push(window.setTimeout(() => showCandidate(0), 350));
      timers.current.push(window.setTimeout(() => showSlot(index + 1), 420));
    };

    showSlot(0);
  }, [clearTimers]);

  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      clearTimers();
      animationStarted.current = true;
      setLetters(titleGuess.map(({ letter }) => letter));
      setActiveIndex(null);
      setOptionIndex(0);
      setFinished(true);
      return;
    }
    if (animationStarted.current || !root.current) return;
    if (!("IntersectionObserver" in window)) {
      replay();
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        replay();
      }
    }, { threshold: 0.15 });
    observer.observe(root.current);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [clearTimers, ready, reduced, replay]);

  const pillText = finished
    ? `Most likely: ${word}`
    : titleGuess[currentIndex].candidates.map(([letter, percent]) => `${letter} ${percent}%`).join(" · ");

  return <div className="title-guess" ref={root} role="group" aria-labelledby="title-guess-label" data-finished={finished} data-active-index={activeIndex ?? ""}>
    <span className="sr-only" id="title-guess-label">Wordplay, spelled out by a guessing demo</span>
    <div className="title-guess-tiles" aria-hidden="true">
      {letters.map((letter, index) => <span key={index} className="title-guess-tile" data-filled={letter === titleGuess[index].letter} data-active={activeIndex === index} data-option={activeIndex === index ? optionIndex : undefined}><span className="title-guess-letter">{letter}</span></span>)}
    </div>
    <div className="title-guess-note">
      <p className="title-guess-pill" aria-hidden="true" data-complete={finished}>{pillText}</p>
      <p className="title-guess-caption">Demo odds, not a real model: a model guesses one piece at a time, like this.</p>
      {!reduced && <button type="button" className="title-guess-replay" onClick={replay}>Replay</button>}
    </div>
  </div>;
}
