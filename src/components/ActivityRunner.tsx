import type { Activity } from "@/content/types";
import { Classifier } from "./activities/Classifier";
import { PromptLab } from "./activities/PromptLab";
import { Scenarios } from "./activities/Scenarios";
import { CaseStudies } from "./activities/CaseStudies";
import { Capstone } from "./activities/Capstone";

export function ActivityRunner({ activity, moduleId }: { activity: Activity; moduleId: string }) {
  if (activity.kind === "classifier") return <Classifier activity={activity} moduleId={moduleId} />;
  if (activity.kind === "prompt-lab") return <PromptLab activity={activity} moduleId={moduleId} />;
  if (activity.kind === "scenarios") return <Scenarios activity={activity} moduleId={moduleId} />;
  if (activity.kind === "case-studies") return <CaseStudies activity={activity} moduleId={moduleId} />;
  return <Capstone activity={activity} moduleId={moduleId} />;
}
