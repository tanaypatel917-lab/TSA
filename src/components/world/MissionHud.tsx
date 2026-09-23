import type { Mission } from "@/content/missions";
import { RUN, type Run } from "@/engine/mission";

type Props = { mission: Mission; run: Run; onQuit: () => void; inline?: boolean };

export function MissionHud({ mission, run, onQuit, inline }: Props) {
  const seconds = Math.ceil(run.timeLeft);
  const lives = RUN.lives - run.mistakes;
  return <div className={`mission-hud${inline ? " is-inline" : ""}`} data-urgent={!run.relaxed && seconds <= 10}>
    <div className="mission-hud-title"><span>Mission</span><strong>{mission.title}</strong></div>
    <div className="mission-hud-clock" aria-label={run.relaxed ? "Relaxed mode, no clock" : `${seconds} seconds left`}>
      <span className="mission-hud-time">{run.relaxed ? "∞" : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}</span>
      {!run.relaxed && <span className="mission-hud-track" aria-hidden="true"><span style={{ transform: `scaleX(${run.timeLeft / RUN.seconds})` }} /></span>}
    </div>
    <dl className="mission-hud-stats">
      <div><dt>Score</dt><dd>{run.score.toLocaleString()}</dd></div>
      <div><dt>Combo</dt><dd data-hot={run.combo > 1}>×{Math.max(1, run.combo)}</dd></div>
      <div><dt>Crates</dt><dd>{run.results.length}/{run.order.length}</dd></div>
      <div><dt>Lives</dt><dd className="mission-lives" aria-label={`${lives} of ${RUN.lives} lives left`}>{Array.from({ length: RUN.lives }, (_, index) => <span key={index} aria-hidden="true" data-on={index < lives}>?</span>)}</dd></div>
    </dl>
    <button type="button" className="mission-quit" onClick={onQuit}>Quit <span aria-hidden="true">Esc</span></button>
  </div>;
}
