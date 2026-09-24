import type { Mission } from "@/content/missions";
import { MODES, type Run } from "@/engine/mission";

type Props = { mission: Mission; run: Run; onQuit: () => void; inline?: boolean; sound?: boolean; onSound?: () => void };

export function MissionHud({ mission, run, onQuit, inline, sound, onSound }: Props) {
  const seconds = Math.ceil(run.timeLeft);
  const lives = run.lives - run.mistakes;
  return <div className={`mission-hud${inline ? " is-inline" : ""}`} data-urgent={!run.relaxed && seconds <= 10}>
    <div className="mission-hud-title"><span>Mission · {MODES[run.mode].label}</span><strong>{mission.title}</strong></div>
    <div className="mission-hud-clock" aria-label={run.relaxed ? "Relaxed mode, no clock" : `${seconds} seconds left`}>
      <span className="mission-hud-time">{run.relaxed ? "∞" : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}</span>
      {!run.relaxed && <span className="mission-hud-track" aria-hidden="true"><span style={{ transform: `scaleX(${run.timeLeft / run.seconds})` }} /></span>}
    </div>
    <dl className="mission-hud-stats">
      <div><dt>Score</dt><dd>{run.score.toLocaleString()}</dd></div>
      <div><dt>Combo</dt><dd data-hot={run.combo > 1}>×{Math.max(1, run.combo)}</dd></div>
      <div><dt>Crates</dt><dd>{run.results.length}/{run.order.length}</dd></div>
      <div><dt>Lives</dt><dd className="mission-lives" aria-label={`${lives} of ${run.lives} lives left`}>{Array.from({ length: run.lives }, (_, index) => <span key={index} aria-hidden="true" data-on={index < lives}>?</span>)}</dd></div>
    </dl>
    <div className="mission-hud-buttons">{onSound && <button type="button" className="mission-quit" aria-pressed={sound} onClick={onSound}>{sound ? "Sound on" : "Sound off"}</button>}<button type="button" className="mission-quit" onClick={onQuit}>Quit <span aria-hidden="true">Esc</span></button></div>
  </div>;
}
