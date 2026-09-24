import { BADGES } from "@/engine/badges";

export type TourStop = { path: string; target: string; title: string; text: string };

export const tourStops: TourStop[] = [
  { path: "/", target: ".demo", title: "Welcome to Wordplay", text: "A hands-on AI literacy course for grades 9–12. Start with the live demo: a tiny language model guesses the next word, and you can watch its probabilities change." },
  { path: "/modules/", target: ".spine", title: "Five chapters, one course", text: "Foundations, Tools and Ethics cover the brief’s three required sections, Real world shows where AI matters, and the Capstone ties them together. Each block is a lesson, sized by reading time." },
  { path: "/modules/ai-foundations/lessons/what-is-ai/", target: ".lesson-reading", title: "Lessons that explain themselves", text: "Hover or tap an underlined term for its definition. Every lesson ends with key takeaways and the sources behind it." },
  { path: "/modules/ai-tools/activity/", target: ".prompt-lab", title: "Practice, not just reading", text: "Rewrite a weak prompt and a rubric checks it instantly, on your device. Every chapter has an activity and a five-question quiz." },
  { path: "/play/", target: ".world", title: "Wordplay World", text: "Our game mode. Drive to a station and sort crates through the right gate against the clock. Without 3D it opens as a map with the same missions." },
  { path: "/learn/", target: ".question-meter", title: "Progress you can see", text: `XP, levels, streaks, ${BADGES.length} badges and a map of every step. Progress stays in this browser and can be exported to a file.` },
  { path: "/references/", target: ".evidence", title: "Every fact has a source", text: "The evidence board links each lesson to the research behind it, with APA citations, credits and our copyright checklist." },
  { path: "/about/", target: ".about-built", title: "How we built it", text: "Our research, design system, stack, testing, accessibility and privacy choices. Thanks for taking the tour." }
];
