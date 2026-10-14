"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { scrollToElement } from "./SmoothScroll";
import { useMotionPreference } from "./MotionPreferences";
import { pickVoice } from "./SayButton";

type HighlightRegistry = {
  set: (name: string, value: object) => unknown;
  delete: (name: string) => boolean;
};

type HighlightConstructor = new (...ranges: Range[]) => object;

function wordRange(paragraph: HTMLElement, charIndex: number, charLength: number) {
  const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if ((node as Text).length > 0) nodes.push(node as Text);
    node = walker.nextNode();
  }

  const total = nodes.reduce((length, text) => length + text.length, 0);
  if (total === 0) return null;

  const start = Math.max(0, Math.min(charIndex, total - 1));
  const end = Math.max(start + 1, Math.min(total, start + Math.max(1, charLength)));
  let offset = 0;
  let startNode: Text | undefined;
  let startOffset = 0;
  let endNode: Text | undefined;
  let endOffset = 0;

  for (const text of nodes) {
    const nodeEnd = offset + text.length;
    if (!startNode && start < nodeEnd) {
      startNode = text;
      startOffset = start - offset;
    }
    if (end <= nodeEnd) {
      endNode = text;
      endOffset = end - offset;
      break;
    }
    offset = nodeEnd;
  }

  if (!startNode) return null;
  if (!endNode) {
    endNode = nodes[nodes.length - 1];
    endOffset = endNode.length;
  }

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}

function clearWordHighlight() {
  if (typeof CSS === "undefined") return;
  const registry = (CSS as typeof CSS & { highlights?: HighlightRegistry }).highlights;
  registry?.delete("wordplay-reading");
}

function clearParagraphHighlights() {
  document.querySelectorAll<HTMLElement>("[data-paragraph][data-speaking]").forEach((paragraph) => paragraph.removeAttribute("data-speaking"));
}

export function ListenButton({ paragraphs }: { paragraphs: string[] }) {
  const { reduced } = useMotionPreference();
  const [supported, setSupported] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const sequence = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const listenButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;
    setSupported(true);
    window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    const paragraphsInLesson = document.querySelectorAll<HTMLElement>("[data-paragraph]");
    paragraphsInLesson.forEach((paragraph) => {
      if (Number(paragraph.dataset.paragraph) === position) paragraph.setAttribute("data-speaking", "true");
      else paragraph.removeAttribute("data-speaking");
    });

    if (position === null) return;
    const paragraph = document.querySelector<HTMLElement>(`[data-paragraph="${position}"]`);
    if (!paragraph) return;
    if (reduced) paragraph.scrollIntoView({ block: "center" });
    else scrollToElement(paragraph);
  }, [position, reduced]);

  useEffect(() => () => {
    sequence.current += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    clearWordHighlight();
    clearParagraphHighlights();
  }, [paragraphs]);

  useEffect(() => {
    const stopForPresent = () => {
      sequence.current += 1;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      utteranceRef.current = null;
      clearWordHighlight();
      clearParagraphHighlights();
      setPosition(null);
      setPaused(false);
    };
    window.addEventListener("wordplay:present-open", stopForPresent);
    return () => window.removeEventListener("wordplay:present-open", stopForPresent);
  }, []);

  function finish() {
    utteranceRef.current = null;
    clearWordHighlight();
    clearParagraphHighlights();
    setPosition(null);
    setPaused(false);
  }

  function readParagraph(index: number, currentSequence: number) {
    if (currentSequence !== sequence.current || index >= paragraphs.length) return;
    clearWordHighlight();
    setPosition(index);

    const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "en-US";
    utterance.rate = 1;
    utteranceRef.current = utterance;
    utterance.onstart = () => {
      if (currentSequence === sequence.current) {
        setPosition(index);
        setPaused(false);
      }
    };
    utterance.onboundary = (event) => {
      if (event.name !== "word" || currentSequence !== sequence.current || utteranceRef.current !== utterance) return;
      const paragraph = document.querySelector<HTMLElement>(`[data-paragraph="${index}"]`);
      const Highlight = (globalThis as typeof globalThis & { Highlight?: HighlightConstructor }).Highlight;
      const registry = typeof CSS === "undefined" ? undefined : (CSS as typeof CSS & { highlights?: HighlightRegistry }).highlights;
      if (!paragraph || !registry || !Highlight) return;
      const range = wordRange(paragraph, event.charIndex, event.charLength);
      if (range) registry.set("wordplay-reading", new Highlight(range));
    };
    utterance.onend = () => {
      if (currentSequence !== sequence.current) return;
      clearWordHighlight();
      if (index + 1 < paragraphs.length) readParagraph(index + 1, currentSequence);
      else finish();
    };
    utterance.onerror = () => {
      if (currentSequence === sequence.current) finish();
    };
    window.speechSynthesis.speak(utterance);
  }

  function start() {
    const currentSequence = ++sequence.current;
    window.speechSynthesis.cancel();
    clearWordHighlight();
    clearParagraphHighlights();
    setPosition(0);
    setPaused(false);
    readParagraph(0, currentSequence);
  }

  function stop() {
    sequence.current += 1;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    clearWordHighlight();
    clearParagraphHighlights();
    setPosition(null);
    setPaused(false);
  }

  function togglePause() {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  if (!supported) return null;

  return <div className="listen-controls">
    <button ref={listenButton} type="button" className="listen-button" aria-pressed={position !== null} onClick={start}>▶ Listen</button>
    <span className="listen-status" role="status" aria-live="polite">{position === null ? "" : `Reading paragraph ${position + 1} of ${paragraphs.length}`}</span>
    {position !== null && createPortal(
      <div className="listen-floating" role="group" aria-label="Listen controls">
        <button type="button" className="listen-button" onClick={togglePause}>{paused ? "▶ Resume" : "❚❚ Pause"}</button>
        <button type="button" className="listen-button listen-stop" onClick={() => { stop(); listenButton.current?.focus(); }}>■ Stop</button>
        <span className="listen-floating-label" aria-hidden="true">Reading {position + 1}/{paragraphs.length}</span>
      </div>,
      document.body
    )}
  </div>;
}
