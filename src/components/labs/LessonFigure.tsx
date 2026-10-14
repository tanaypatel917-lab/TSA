"use client";

import type { FigureKind } from "@/content/figures";
import { NextWordDemo } from "../NextWordDemo";
import { BiasLab } from "./BiasLab";
import { ChatbotLab } from "./ChatbotLab";
import { ClaimCheck } from "./ClaimCheck";
import { CookieLab } from "./CookieLab";
import { DetectorLab } from "./DetectorLab";
import { FakePageLab } from "./FakePageLab";
import { JuryLab } from "./JuryLab";
import { PromptBuilder } from "./PromptBuilder";
import { PromptDiceLab } from "./PromptDiceLab";
import { Redactor } from "./Redactor";
import { RuleLab } from "./RuleLab";
import { SystemDiagram } from "./SystemDiagram";
import { TokenLab } from "./TokenLab";
import { TrainLab } from "./TrainLab";
import { VariabilityLab } from "./VariabilityLab";

const figures: Record<FigureKind, () => JSX.Element> = { system: SystemDiagram, rules: RuleLab, chatbot: ChatbotLab, tokens: TokenLab, predictor: () => <div className="lab-demo"><NextWordDemo /></div>, bias: BiasLab, train: TrainLab, claims: ClaimCheck, prompt: PromptBuilder, dice: PromptDiceLab, vary: VariabilityLab, redact: Redactor, fakepage: FakePageLab, jury: JuryLab, detector: DetectorLab, cookies: CookieLab };

export function LessonFigure({ kind }: { kind: FigureKind }) {
  const Figure = figures[kind];
  return <Figure />;
}
