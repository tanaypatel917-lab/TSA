"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "@/components/MotionPreferences";
import { detectorCopy, detectorPassages, detectorScoreLabel, type DetectorPassageId } from "@/content/detector";
import { LabFrame } from "./LabFrame";

export function DetectorLab() {
  const [selectedId, setSelectedId] = useState<DetectorPassageId>("declaration");
  const [scanning, setScanning] = useState(false);
  const [resultId, setResultId] = useState<DetectorPassageId | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { reduced } = useMotionPreference();
  const passage = detectorPassages.find(({ id }) => id === selectedId)!;
  const result = resultId ? detectorPassages.find(({ id }) => id === resultId)! : null;

  useEffect(() => () => {
    if (scanTimer.current) clearTimeout(scanTimer.current);
  }, []);

  function choosePassage(id: DetectorPassageId) {
    if (scanTimer.current) clearTimeout(scanTimer.current);
    scanTimer.current = null;
    setSelectedId(id);
    setScanning(false);
    setResultId(null);
    setAnnouncement("");
  }

  function finishScan(id: DetectorPassageId) {
    const scannedPassage = detectorPassages.find((item) => item.id === id)!;
    setScanning(false);
    setResultId(id);
    setAnnouncement(`Score: ${scannedPassage.score}% AI`);
    scanTimer.current = null;
  }

  function scan() {
    if (scanTimer.current) clearTimeout(scanTimer.current);
    setResultId(null);
    setAnnouncement("");
    if (reduced) {
      finishScan(selectedId);
      return;
    }
    setScanning(true);
    scanTimer.current = setTimeout(() => finishScan(selectedId), 1200);
  }

  const hoodContent = <>
    <p>{detectorCopy.hoodIntro}</p>
    <ul className="detector-hood-list">{detectorPassages.map((item) => <li key={item.id}>
      <strong>{item.key} · {item.score}%</strong>
      <span>{item.truth}</span>
    </li>)}</ul>
  </>;

  return <LabFrame
    id="lab-detector"
    kicker={detectorCopy.kicker}
    title={detectorCopy.title}
    note={detectorCopy.note}
    sources="detector"
    hood={{ spec: detectorCopy.spec, content: hoodContent }}
  >
    <div className="detector-tool-heading">
      <strong>TruthMeter</strong>
      <span>(invented for this lesson)</span>
    </div>
    <div className="lab-choices detector-passage-picker" role="group" aria-label="Choose a passage">
      {detectorPassages.map((item) => <button
        key={item.id}
        type="button"
        className="detector-passage-key"
        aria-pressed={selectedId === item.id}
        onClick={() => choosePassage(item.id)}
      >
        {item.key}
      </button>)}
    </div>
    <article className="detector-passage" aria-label={`${passage.key} text`}>
      <p>{passage.text}</p>
    </article>
    <button className="button-primary detector-scan-button" type="button" onClick={scan} disabled={scanning}>
      {detectorCopy.scan}
    </button>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

    {scanning && <div className="detector-scanning" aria-label="Scanning passage style">
      <span className="detector-scan-track"><i /></span>
      <p>Checking style signals…</p>
    </div>}

    {result && <section className="detector-result" aria-labelledby="detector-result-heading">
      <div className="detector-result-top">
        <div
          className="detector-gauge"
          role="meter"
          aria-label={`${result.score}% AI score`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={result.score}
          style={{ "--score": `${result.score}%` } as React.CSSProperties}
        >
          <div className="detector-gauge-face"><strong>{result.score}% AI</strong><span>TruthMeter score</span></div>
        </div>
        <div className="detector-result-summary">
          <p className="detector-result-tool">TruthMeter result</p>
          <h4 id="detector-result-heading" className="detector-score-label">{detectorScoreLabel(result.score)}</h4>
        </div>
      </div>
      <div className="detector-explanation">
        <section>
          <h5>Who really wrote it?</h5>
          <p>{result.truth}</p>
        </section>
        <section>
          <h5>Why it scored this way:</h5>
          <p>{result.signals}</p>
        </section>
      </div>
      <p className="detector-point">{detectorCopy.point}</p>
      <section className="detector-talk" aria-labelledby="detector-talk-heading">
        <h4 id="detector-talk-heading">{detectorCopy.talkHeading}</h4>
        <ul>{detectorCopy.questions.map((question) => <li key={question}>{question}</li>)}</ul>
      </section>
    </section>}
  </LabFrame>;
}
