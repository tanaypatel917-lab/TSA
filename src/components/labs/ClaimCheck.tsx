"use client";

import { useState } from "react";
import { LabFrame } from "./LabFrame";

const claims = [
  { text: "The Eiffel Tower was completed in 1889 for the World’s Fair in Paris.", real: true, fix: "True. It opened for the 1889 Exposition Universelle." },
  { text: "It was designed by Leonardo da Vinci.", real: false, fix: "Invented. Gustave Eiffel’s engineering company designed and built it, about 370 years after Leonardo died." },
  { text: "Today it is about 330 meters tall.", real: true, fix: "True. Its height, including antennas, is about 330 meters." },
  { text: "It was first painted bright blue.", real: false, fix: "Invented. Its first coat was a red-brown color, and it has been repainted in shades of brown since." },
  { text: "A 2019 University of Paris study found it sways up to 3 meters in the wind.", real: false, fix: "Invented, with a fake-sounding source. The tower moves only a few centimeters in strong wind." }
];

export function ClaimCheck() {
  const [calls, setCalls] = useState<Record<number, boolean>>({});
  const done = Object.keys(calls).length === claims.length;
  const caught = claims.filter((claim, index) => !claim.real && calls[index] === false).length;
  return <LabFrame id="lab-claims" title="Spot the hallucinations." note="Hallucinations sound exactly as confident as facts, and invented sources are a warning sign. Check claims that matter against an encyclopedia, an official website or a textbook.">
    <p className="claim-prompt"><span>You asked</span> “Tell me about the Eiffel Tower.”</p>
    <ol className="claim-list">
      {claims.map((claim, index) => {
        const call = calls[index];
        const decided = call !== undefined;
        return <li key={claim.text} data-state={decided ? (call === claim.real ? "right" : "wrong") : undefined}>
          <p>{claim.text}</p>
          {!decided ? <div className="claim-actions" role="group" aria-label={`Is this claim true? ${claim.text}`}>
            <button type="button" onClick={() => setCalls((current) => ({ ...current, [index]: true }))}>Looks true</button>
            <button type="button" onClick={() => setCalls((current) => ({ ...current, [index]: false }))}>Made up</button>
          </div> : <p className="claim-fix" role="status"><strong>{call === claim.real ? "Good call." : "Not quite."}</strong> {claim.fix}</p>}
        </li>;
      })}
    </ol>
    {done && <p className="lab-score" role="status"><strong>You caught {caught} of {claims.filter((claim) => !claim.real).length}</strong> invented claims. <button type="button" className="text-link" onClick={() => setCalls({})}>Try again</button></p>}
  </LabFrame>;
}
