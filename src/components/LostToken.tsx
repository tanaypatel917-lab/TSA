"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LOST_TOKENS, type LostTokenId } from "@/content/lostTokens";
import { FOUND_KEY, loadFound, saveFound } from "@/engine/lostTokens";
import { play } from "./world/sound";
import "./lost-tokens.css";

type FoundTokensState = { ids: string[]; ok: boolean; hydrated: boolean };

export function useFoundTokens() {
  const [found, setFound] = useState<FoundTokensState>({ ids: [], ok: true, hydrated: false });

  useEffect(() => {
    const sync = () => setFound({ ...loadFound(), hydrated: true });
    const handleStorage = (event: StorageEvent) => {
      if (event.key === FOUND_KEY || event.key === null) sync();
    };
    sync();
    window.addEventListener("wordplay:found", sync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("wordplay:found", sync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return found;
}

export function LostToken({ id }: { id: LostTokenId }) {
  const found = useFoundTokens();
  const [open, setOpen] = useState(false);
  const [popping, setPopping] = useState(false);
  const token = LOST_TOKENS.find((item) => item.id === id)!;
  const isFound = found.ids.includes(id);

  useEffect(() => {
    if (!popping) return;
    const timer = window.setTimeout(() => setPopping(false), 560);
    return () => window.clearTimeout(timer);
  }, [popping]);

  if (!found.hydrated) return null;

  function collect() {
    setOpen((value) => !value);
    if (isFound) return;
    if (!saveFound([...found.ids, id])) return;
    setPopping(true);
    play("tick");
  }

  return <div className="lost-token">
    <button
      type="button"
      className="lost-token-chip"
      aria-label={`Lost token ${token.glyph}. Collect it.`}
      aria-pressed={isFound}
      data-found={isFound}
      data-pop={popping || undefined}
      onClick={collect}
    >
      <span>{token.glyph}</span>
      {isFound && <span className="lost-token-check" aria-hidden="true">✓</span>}
    </button>
    {open && <div className="lost-token-popover" role="status">
      <strong>Found {found.ids.length} of {LOST_TOKENS.length} · {token.glyph}</strong>
      <p>{token.note}</p>
      <Link href="/badges#lost-tokens">See your collection <span aria-hidden="true">↗</span></Link>
    </div>}
  </div>;
}
