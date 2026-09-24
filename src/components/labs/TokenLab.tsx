"use client";

import { useState } from "react";
import { tokens } from "@/engine/labs";
import { LabFrame } from "./LabFrame";

export function TokenLab() {
  const [text, setText] = useState("Unbelievable! Language models don't read words, they read tokens.");
  const pieces = tokens(text);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return <LabFrame id="lab-tokens" title="See text the way a model does." note="This is a simplified tokenizer that splits off punctuation, contractions and common word parts. Real tokenizers learn their pieces from data, so each model splits text a little differently.">
    <label className="lab-field"><span>Type anything</span><textarea rows={2} value={text} onChange={(event) => setText(event.target.value)} maxLength={240} /></label>
    <p className="token-strip" aria-label={`Tokens: ${pieces.map((piece) => piece.trim()).join(" | ")}`}>
      {pieces.map((piece, index) => <span key={index} className="token" data-tone={index % 5}>{piece.replace(/ /g, "·")}</span>)}
    </p>
    <dl className="lab-stats" aria-live="polite">
      <div><dt>Words</dt><dd>{words}</dd></div>
      <div><dt>Tokens</dt><dd>{pieces.length}</dd></div>
      <div><dt>Tokens per word</dt><dd>{words ? (pieces.length / words).toFixed(1) : "0"}</dd></div>
    </dl>
  </LabFrame>;
}
