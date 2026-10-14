"use client";

import { useEffect, useReducer } from "react";
import { useMotionPreference } from "@/components/MotionPreferences";
import { PRESETS, START, predict, score, step, type Model } from "@/engine/train";
import { LabFrame } from "./LabFrame";

const SIZE = 300;
const MAX_STEPS = 60;
type Preset = keyof typeof PRESETS;
type Point = { x: number; y: number };
type State = { preset: Preset; model: Model; steps: number; running: boolean; status: string };
type Action =
  | { type: "select"; preset: Preset }
  | { type: "reset" }
  | { type: "start" }
  | { type: "pause" }
  | { type: "epoch" }
  | { type: "step-once" }
  | { type: "finish" };

function freshState(preset: Preset): State {
  return { preset, model: { ...START }, steps: 0, running: false, status: "" };
}

function statusFor(state: State): string {
  const percentage = Math.round(score(state.model, PRESETS[state.preset]) * 100);
  if (percentage === 100) return `Sorted in ${state.steps} steps. The rule came from the examples, not from a person.`;
  if (state.preset === "ring" || state.steps >= MAX_STEPS) {
    return `${percentage}% after ${state.steps} steps. A straight line can't circle the middle. Real models stack many lines, in layers, to bend the boundary.`;
  }
  return `Paused at ${percentage}% after ${state.steps} steps.`;
}

function advance(state: State, keepRunning: boolean): State {
  const data = PRESETS[state.preset];
  const model = step(state.model, data);
  const next = { ...state, model, steps: state.steps + 1, running: keepRunning, status: "" };
  if (score(model, data) === 1) return { ...next, running: false, status: statusFor(next) };
  if (next.steps >= MAX_STEPS) return { ...next, running: false, status: statusFor(next) };
  return next;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return freshState(action.preset);
    case "reset":
      return freshState(state.preset);
    case "start":
      return { ...state, running: true, status: "" };
    case "pause":
      return { ...state, running: false, status: statusFor(state) };
    case "epoch":
      return state.running ? advance(state, true) : state;
    case "step-once":
      return advance(state, false);
    case "finish": {
      let current = { ...state, running: true, status: "" };
      while (current.running) current = advance(current, true);
      return current;
    }
  }
}

function lineIntersections(model: Model): Point[] {
  const points: Point[] = [];
  const add = (point: Point) => {
    if (point.x < -1e-8 || point.x > 1 + 1e-8 || point.y < -1e-8 || point.y > 1 + 1e-8) return;
    if (points.some((existing) => Math.abs(existing.x - point.x) < 1e-8 && Math.abs(existing.y - point.y) < 1e-8)) return;
    points.push({ x: Math.max(0, Math.min(1, point.x)), y: Math.max(0, Math.min(1, point.y)) });
  };
  if (model.w2 !== 0) {
    add({ x: 0, y: -model.b / model.w2 });
    add({ x: 1, y: -(model.w1 + model.b) / model.w2 });
  }
  if (model.w1 !== 0) {
    add({ x: -model.b / model.w1, y: 0 });
    add({ x: -(model.w2 + model.b) / model.w1, y: 1 });
  }
  return points.slice(0, 2);
}

function positivePolygon(model: Model): Point[] {
  const corners = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
  const value = (point: Point) => model.w1 * point.x + model.w2 * point.y + model.b;
  const polygon: Point[] = [];
  for (let index = 0; index < corners.length; index += 1) {
    const current = corners[index];
    const next = corners[(index + 1) % corners.length];
    const currentValue = value(current);
    const nextValue = value(next);
    const currentInside = currentValue >= 0;
    const nextInside = nextValue >= 0;
    if (currentInside) polygon.push(current);
    if (currentInside !== nextInside) {
      const amount = currentValue / (currentValue - nextValue);
      polygon.push({
        x: current.x + amount * (next.x - current.x),
        y: current.y + amount * (next.y - current.y)
      });
    }
  }
  return polygon;
}

const plotX = (value: number) => value * SIZE;
const plotY = (value: number) => (1 - value) * SIZE;
const plotPoints = (points: Point[]) => points.map(({ x, y }) => `${plotX(x)},${plotY(y)}`).join(" ");

export function TrainLab() {
  const [state, dispatch] = useReducer(reducer, freshState("blobs"));
  const { reduced } = useMotionPreference();
  const data = PRESETS[state.preset];
  const accuracy = score(state.model, data);
  const percentage = Math.round(accuracy * 100);
  const boundary = lineIntersections(state.model);
  const positive = positivePolygon(state.model);

  useEffect(() => {
    if (!state.running) return;
    if (reduced) {
      dispatch({ type: "finish" });
      return;
    }
    const timer = window.setInterval(() => dispatch({ type: "epoch" }), 120);
    return () => window.clearInterval(timer);
  }, [state.running, reduced]);

  function train() {
    if (state.running) dispatch({ type: "pause" });
    else if (reduced) dispatch({ type: "finish" });
    else dispatch({ type: "start" });
  }

  return <LabFrame
    id="lab-train"
    sources="rules"
    title="Teach the machine: train a line that sorts dots."
    note="A real, tiny model (a perceptron) trained in your browser on made-up dots. Each step nudges the line toward the dots it got wrong."
  >
    <div className="train-grid">
      <div className="train-visual">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="bias-plot train-plot"
          role="img"
          aria-label={`Perceptron decision boundary; ${percentage}% of training dots sorted correctly.`}
        >
          <defs><clipPath id="train-plot-clip"><rect width={SIZE} height={SIZE} /></clipPath></defs>
          <rect width={SIZE} height={SIZE} className="plot-bg" />
          <g clipPath="url(#train-plot-clip)">
            {positive.length > 0 && <polygon points={plotPoints(positive)} className="train-positive-side" />}
            {boundary.length === 2 && <line
              x1={plotX(boundary[0].x)}
              y1={plotY(boundary[0].y)}
              x2={plotX(boundary[1].x)}
              y2={plotY(boundary[1].y)}
              className="plot-line"
            />}
            {data.map((dot, index) => {
              const x = plotX(dot.x);
              const y = plotY(dot.y);
              const wrong = predict(state.model, dot.x, dot.y) !== dot.label;
              return <g key={index}>
                {wrong && <circle cx={x} cy={y} r="8" className="train-error-ring" />}
                {dot.label === 1
                  ? <circle cx={x} cy={y} r="4.5" className="train-dot" data-label="positive" />
                  : <rect x={x - 4} y={y - 4} width="8" height="8" className="train-dot" data-label="negative" />}
              </g>;
            })}
          </g>
          <text x="8" y="15" className="plot-axis">feature 2 ↑</text>
          <text x={SIZE - 8} y={SIZE - 8} textAnchor="end" className="plot-axis">feature 1 →</text>
        </svg>
        <p className="train-key"><span><i className="train-key-dot" /> label 1</span><span><i className="train-key-square" /> label −1</span><span><i className="train-key-ring" /> sorted wrong</span></p>
      </div>
      <div className="train-controls">
        <div className="lab-choices train-presets" role="group" aria-label="Choose a dot dataset">
          <button type="button" aria-pressed={state.preset === "blobs"} onClick={() => dispatch({ type: "select", preset: "blobs" })}>Two blobs</button>
          <button type="button" aria-pressed={state.preset === "diagonal"} onClick={() => dispatch({ type: "select", preset: "diagonal" })}>Diagonal</button>
          <button type="button" aria-pressed={state.preset === "ring"} onClick={() => dispatch({ type: "select", preset: "ring" })}>A ring</button>
        </div>
        <p className="train-counter" aria-live="off">Step {state.steps} · {percentage}% sorted</p>
        <div className="train-actions">
          <button className="button-primary" type="button" onClick={train}>{state.running ? "Pause" : "Train"}</button>
          <button type="button" onClick={() => dispatch({ type: "step-once" })} disabled={state.running}>Step once</button>
          <button type="button" onClick={() => dispatch({ type: "reset" })}>Reset</button>
        </div>
        <p className="train-status" role="status">{state.status}</p>
      </div>
    </div>
  </LabFrame>;
}
