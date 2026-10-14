"use client";

import { LOST_TOKENS } from "@/content/lostTokens";
import { useFoundTokens } from "./LostToken";
import "./lost-tokens.css";

export function LostTokenAlbum() {
  const { ids } = useFoundTokens();
  const found = new Set(ids);
  return <section className="lost-token-album" id="lost-tokens" aria-labelledby="lost-token-album-title">
    <header className="lost-token-album-head">
      <div>
        <p className="section-index">A small side quest</p>
        <h2 id="lost-token-album-title">Lost tokens</h2>
      </div>
      <p className="lost-token-count">{ids.length} / {LOST_TOKENS.length} found</p>
    </header>
    <ul className="lost-token-slots">
      {LOST_TOKENS.map((token, index) => {
        const isFound = found.has(token.id);
        return <li key={token.id} className="lost-token-slot" data-found={isFound} data-tone={index % 3}>
          {isFound
            ? <div className="lost-token-slot-card">
              <span className="lost-token-slot-label">FOUND · {String(index + 1).padStart(2, "0")}</span>
              <strong className="lost-token-slot-glyph">{token.glyph}</strong>
              <p>{token.note}</p>
            </div>
            : <div className="lost-token-slot-card">
              <span className="lost-token-slot-label">HIDDEN · {String(index + 1).padStart(2, "0")}</span>
              <span className="lost-token-mystery" aria-hidden="true">?</span>
              <p>{token.hint}</p>
            </div>}
        </li>;
      })}
    </ul>
    {ids.length === LOST_TOKENS.length && <p className="lost-token-complete">All six found. You know the tokens most people never see.</p>}
  </section>;
}
