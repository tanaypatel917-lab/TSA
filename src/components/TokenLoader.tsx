import type { CSSProperties } from "react";

export function countTokens(tokens: readonly string[]): number {
  return tokens.length;
}

export function TokenLoader({ label, tokens }: { label: string; tokens: readonly string[] }) {
  const count = countTokens(tokens);
  const cycleDuration = count * 350 + 900;
  const animationName = `token-loader-cycle-${count}`;
  const fadeDuration = 16;
  const lightEnd = (350 / cycleDuration) * 100;
  const animation = `@keyframes ${animationName} {
    0% { background-color: var(--paper); }
    ${(fadeDuration / cycleDuration) * 100}% { background-color: var(--clay); }
    ${((350 - fadeDuration) / cycleDuration) * 100}% { background-color: var(--clay); }
    ${lightEnd}% { background-color: var(--paper); }
    100% { background-color: var(--paper); }
  }`;

  return <div className="token-loader" style={{ "--token-animation": animationName, "--token-cycle": `${cycleDuration}ms` } as CSSProperties}>
    <style>{animation}</style>
    <span className="sr-only">{label}…</span>
    <p className="token-loader-kicker">While the island loads</p>
    <div className="token-loader-row" aria-hidden="true">
      {tokens.map((token, index) => {
        const hasSpace = token.startsWith(" ");
        return <span className="token-loader-chip" key={`${token}-${index}`} style={{ "--i": index } as CSSProperties}>
          {hasSpace && <span className="token-loader-space">·</span>}
          {hasSpace ? token.slice(1) : token}
        </span>;
      })}
    </div>
    <div className="token-loader-meta">
      <span className="token-loader-count" aria-hidden="true">{count} tokens</span>
      <p className="token-loader-caption">Models read text in chunks called tokens. A model might split “{label}” like this.</p>
    </div>
  </div>;
}
