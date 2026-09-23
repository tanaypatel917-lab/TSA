"use client";

import { useEffect, useRef, useState } from "react";

type Card = { term: string; definition: string };
type Target = "reveal" | "answer" | "summary" | null;

function shuffled(count: number) {
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return order;
}

export function GlossaryStudy({ cards }: { cards: Card[] }) {
  const [order, setOrder] = useState(() => cards.map((_, index) => index));
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [review, setReview] = useState<number[]>([]);
  const target = useRef<Target>(null);
  const revealButton = useRef<HTMLButtonElement>(null);
  const knewButton = useRef<HTMLButtonElement>(null);
  const summary = useRef<HTMLHeadingElement>(null);
  const card = position < order.length ? cards[order[position]] : null;

  useEffect(() => {
    if (!target.current) return;
    ({ reveal: revealButton, answer: knewButton, summary }[target.current]).current?.focus();
    target.current = null;
  }, [position, revealed, order]);

  function start(indices: number[]) { target.current = "reveal"; setOrder(indices); setPosition(0); setRevealed(false); setKnown([]); setReview([]); }
  function reveal() { target.current = "answer"; setRevealed(true); }
  function answer(knew: boolean) {
    const index = order[position];
    (knew ? setKnown : setReview)((list) => [...list, index]);
    target.current = position + 1 >= order.length ? "summary" : "reveal";
    setRevealed(false);
    setPosition((value) => value + 1);
  }

  if (!cards.length) return <p className="study-empty">No terms match this search. Clear it to study every term.</p>;
  if (!card) return <div className="study-summary"><h2 ref={summary} tabIndex={-1}>You knew {known.length} of {order.length}.</h2><p>{review.length ? `${review.length} ${review.length === 1 ? "term is" : "terms are"} worth another look.` : "Every card landed. Try explaining one of them to someone else."}</p><div className="study-actions">{review.length > 0 && <button type="button" className="button-primary" onClick={() => start(review)}>Review the {review.length} you missed</button>}<button type="button" className="button-secondary" onClick={() => start(cards.map((_, index) => index))}>Start over</button></div></div>;
  return <div className="study"><div className="study-status"><p>Card {position + 1} of {order.length}</p><p>{known.length} known, {review.length} to review</p><button type="button" className="study-shuffle" onClick={() => start(shuffled(cards.length))}>Shuffle and restart</button></div><div className="flashcard" data-revealed={revealed}><div className="flashcard-inner"><div className="flashcard-face flashcard-front" aria-hidden={revealed}><span>Term</span><p>{card.term}</p></div><div className="flashcard-face flashcard-back" aria-hidden={!revealed}><span>{card.term}</span><p>{card.definition}</p></div></div></div><div className="study-actions">{revealed ? <><button ref={knewButton} type="button" className="button-primary" onClick={() => answer(true)}>I knew it</button><button type="button" className="button-secondary" onClick={() => answer(false)}>Not yet</button></> : <button ref={revealButton} type="button" className="button-primary" onClick={reveal}>Show definition</button>}</div><p className="sr-only" role="status">{revealed ? `${card.term}: ${card.definition}` : ""}</p></div>;
}
