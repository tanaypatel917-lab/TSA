"use client";

import type { FigureKind } from "@/content/figures";
import { NextWordDemo } from "../NextWordDemo";
import { BiasLab } from "./BiasLab";
import { ClaimCheck } from "./ClaimCheck";
import { PromptBuilder } from "./PromptBuilder";
import { Redactor } from "./Redactor";
import { RuleLab } from "./RuleLab";
import { SystemDiagram } from "./SystemDiagram";
import { TokenLab } from "./TokenLab";
import { VariabilityLab } from "./VariabilityLab";

const figures: Record<FigureKind, () => JSX.Element> = { system: SystemDiagram, rules: RuleLab, tokens: TokenLab, predictor: () => <div className="lab-demo"><NextWordDemo /></div>, bias: BiasLab, claims: ClaimCheck, prompt: PromptBuilder, vary: VariabilityLab, redact: Redactor };

export function LessonFigure({ kind }: { kind: FigureKind }) {
  const Figure = figures[kind];
  return <Figure />;
}
