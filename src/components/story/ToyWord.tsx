"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SCRAMBLE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const ACCENT = "#b02a08";
const LIME = "#c8f560";
const ORANGE = "#ff4f1f";

type Toy = "scramble" | "stack" | "flip";

export function ToyWord({
  word,
  toy,
}: {
  word: string;
  toy: Toy;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const playingRef = useRef(false);
  const scrambleTimerRef = useRef<number | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      if (scrambleTimerRef.current !== null) {
        window.clearInterval(scrambleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const letters = letterRefs.current;
    const button = buttonRef.current;
    return () => {
      gsap.killTweensOf(letters);
      gsap.killTweensOf(button);
    };
  }, []);

  function finish() {
    playingRef.current = false;
  }

  function playReduced() {
    gsap.fromTo(
      buttonRef.current,
      { color: ACCENT },
      { color: LIME, duration: 0.18, repeat: 1, yoyo: true, onComplete: finish }
    );
  }

  function playScramble() {
    const started = performance.now();
    const letters = word.split("");
    letterRefs.current.forEach((letter) => {
      if (letter) {
        letter.style.width = `${letter.getBoundingClientRect().width}px`;
        letter.style.textAlign = "center";
      }
    });
    gsap.to(buttonRef.current, { color: LIME, duration: 0.12 });
    scrambleTimerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - started;
      letterRefs.current.forEach((letter, index) => {
        if (letter) {
          letter.textContent =
            elapsed >= 800
              ? letters[index]
              : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      });
      if (elapsed >= 800) {
        if (scrambleTimerRef.current !== null) {
          window.clearInterval(scrambleTimerRef.current);
          scrambleTimerRef.current = null;
        }
        letterRefs.current.forEach((letter) => {
          if (letter) {
            letter.style.width = "";
            letter.style.textAlign = "";
          }
        });
        gsap.to(buttonRef.current, { color: ACCENT, duration: 0.2, onComplete: finish });
      }
    }, 40);
  }

  function playStack() {
    const timeline = gsap.timeline({ onComplete: finish });
    timeline.to(letterRefs.current, {
      y: -40,
      rotation: (index) => (index % 2 === 0 ? -12 : 12),
      duration: 0.25,
      stagger: 0.04,
      ease: "power2.out",
    });
    timeline.to(letterRefs.current, {
      y: 0,
      rotation: 0,
      duration: 0.8,
      stagger: 0.04,
      ease: "bounce.out",
    }, "+=.05");
  }

  function playFlip() {
    gsap.to(letterRefs.current, {
      rotationX: "+=360",
      duration: 0.9,
      stagger: 0.05,
      ease: "back.out(1.4)",
      onStart: () => {
        gsap.to(buttonRef.current, { color: ORANGE, duration: 0.12 });
      },
      onComplete: () => {
        gsap.to(buttonRef.current, { color: ACCENT, duration: 0.2, onComplete: finish });
      },
    });
  }

  function play() {
    if (playingRef.current) return;
    playingRef.current = true;
    if (reduced) {
      playReduced();
    } else if (toy === "scramble") {
      playScramble();
    } else if (toy === "stack") {
      playStack();
    } else {
      playFlip();
    }
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={`Play with the word ${word}`}
      onClick={play}
      className="inline-flex cursor-pointer border-b-[3px] border-dotted border-current bg-transparent p-0 pb-[.04em] font-inherit text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-dark"
    >
      <span aria-hidden="true">
        {word.split("").map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            ref={(element) => {
              letterRefs.current[index] = element;
            }}
            className="inline-block"
            style={{ transformOrigin: "50% 100%" }}
          >
            {letter}
          </span>
        ))}
      </span>
    </button>
  );
}
