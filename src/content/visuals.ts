import type { Activity } from "./types";

export type SceneAsset = {
  url: string;
  role: "decorative";
  camera: "exported-desktop";
  subject: string;
};

export const KIT_NAME = "Wordplay.World.Kit";

export function hideKit(app: { findObjectByName: (name: string) => { visible: boolean } | undefined }) {
  const kit = app.findObjectByName(KIT_NAME);
  if (kit) kit.visible = false;
}

export const questionScene: SceneAsset = {
  url: process.env.NEXT_PUBLIC_SPLINE_SCENE_URL !== undefined ? process.env.NEXT_PUBLIC_SPLINE_SCENE_URL : "https://prod.spline.design/OLChWT-UUYLcWrKA/scene.splinecode",
  role: "decorative",
  camera: "exported-desktop",
  subject: "Wordplay.Question.Root"
};

export const moduleVisuals: Record<string, { question: string; chapter: string; mark: string }> = {
  foundations: { question: "How does it learn?", chapter: "Foundations", mark: "?" },
  tools: { question: "What should you ask?", chapter: "Tools & techniques", mark: "[ ]" },
  ethics: { question: "Who does it affect?", chapter: "Ethics", mark: "&" },
  "real-world": { question: "Where does it matter?", chapter: "The real world", mark: "↗" },
  capstone: { question: "What will you make?", chapter: "Capstone", mark: "*" }
};

export const activityLabels: Record<Activity["kind"], string> = {
  classifier: "Sorting activity",
  "prompt-lab": "Prompt Lab",
  scenarios: "Decision scenarios",
  "case-studies": "Case-study field notes",
  capstone: "Project plan"
};

export const lessonVisuals: Record<string, { question: string; sections: string[] }> = {
  "foundations/data-and-bias": {
    question: "What happens when the examples leave someone out?",
    sections: ["The examples shape the model", "Past patterns, present bias", "Fairness takes more than a test", "Ask who is missing"]
  }
};
