import { introPalette } from "./intro";
import { foundations } from "./modules/foundations";
import { ethics } from "./modules/ethics";

export type MissionGate = { id: string; label: string; color: string };
export type MissionItem = { text: string; context?: string; gate: string; why: string };
export type Mission = { moduleId: string; title: string; brief: string; gates: [MissionGate, MissionGate]; items: MissionItem[] };

const { rose, citron } = introPalette;

const spamWhy = { spam: "Prizes, urgency, secret deals, or a request for money or a password are classic spam clues.", "not-spam": "An ordinary, specific message about something real in your day." };
const classifier = foundations.activity.kind === "classifier" ? foundations.activity.items : [];
const scenarios = ethics.activity.kind === "scenarios" ? ethics.activity.scenarios : [];

export const missions: Mission[] = [
  {
    moduleId: "foundations",
    title: "Train the spam filter",
    brief: "Every message you sort becomes training data. Drop each one in the right bin and the filter learns the right patterns.",
    gates: [{ id: "spam", label: "Spam", color: rose }, { id: "not-spam", label: "Inbox", color: citron }],
    items: classifier.map((item) => ({ text: item.text, gate: item.label, why: spamWhy[item.label] }))
  },
  {
    moduleId: "tools",
    title: "Tune the prompt",
    brief: "Each crate is a change to a prompt. Decide whether it sharpens the prompt or muddies it.",
    gates: [{ id: "sharpens", label: "Sharpens it", color: citron }, { id: "muddies", label: "Muddies it", color: rose }],
    items: [
      { text: "Add the audience: “for a 9th-grade biology class.”", gate: "sharpens", why: "Naming the audience tells the tool how to pitch the answer." },
      { text: "Just say “make it good.”", gate: "muddies", why: "Vague praise words give the tool nothing to aim for." },
      { text: "Ask for three bullet points under 20 words each.", gate: "sharpens", why: "A clear format and length makes the answer easy to check." },
      { text: "Paste a friend’s full name and home address for context.", gate: "muddies", why: "Private details never belong in a prompt." },
      { text: "Give it a role: “Act as a patient chemistry tutor.”", gate: "sharpens", why: "A role sets the tone and the level of expertise." },
      { text: "Ask five unrelated questions in one prompt.", gate: "muddies", why: "One clear task per prompt gets a focused answer." },
      { text: "Include the source text you want summarized.", gate: "sharpens", why: "Real context reduces made-up details." },
      { text: "Add “trust me, all these facts are right.”", gate: "muddies", why: "Instructions can’t make facts true. You still verify." }
    ]
  },
  {
    moduleId: "ethics",
    title: "Make the call",
    brief: "Each crate is a choice in a real situation. Is it responsible, or should you rethink it?",
    gates: [{ id: "ok", label: "Responsible", color: citron }, { id: "rethink", label: "Rethink it", color: rose }],
    items: scenarios.flatMap((scenario) => scenario.options.map((option) => ({ text: option.text, context: scenario.situation, gate: option.ok ? "ok" : "rethink", why: option.feedback }))).slice(0, 10)
  },
  {
    moduleId: "real-world",
    title: "Keep a human in the loop",
    brief: "AI is great at some jobs. Others need a person to decide. Sort each task.",
    gates: [{ id: "ai", label: "AI can help", color: citron }, { id: "human", label: "A person decides", color: rose }],
    items: [
      { text: "Scanning thousands of river sensor readings to flag floods early.", gate: "ai", why: "Finding patterns in huge data sets is a strength, with experts checking the alerts." },
      { text: "Making the final call on a patient’s diagnosis.", gate: "human", why: "Tools can flag patterns, but a clinician is responsible for the diagnosis." },
      { text: "Drafting captions for a video, then checking them.", gate: "ai", why: "A quick draft helps accessibility when a person reviews it." },
      { text: "Suspending a student based only on an AI risk score.", gate: "human", why: "Decisions that affect a person’s rights need accountable human judgment." },
      { text: "Suggesting practice problems from the quiz questions you missed.", gate: "ai", why: "Low-stakes personalization is a good fit for AI support." },
      { text: "Approving loans with no human review.", gate: "human", why: "High-stakes decisions about people need review and a way to appeal." },
      { text: "Translating a museum sign for a native speaker to review.", gate: "ai", why: "A first draft saves time when a fluent person checks it." },
      { text: "Publishing an AI-written news story nobody checked.", gate: "human", why: "Unchecked output can spread hallucinations as news." }
    ]
  },
  {
    moduleId: "capstone",
    title: "Plan the project",
    brief: "You are planning a school project with AI. Spot the good moves and the red flags.",
    gates: [{ id: "good", label: "Good move", color: citron }, { id: "flag", label: "Red flag", color: rose }],
    items: [
      { text: "Cite the AI tool and say how you used it.", gate: "good", why: "Disclosure keeps authorship honest." },
      { text: "Copy an AI answer without checking a source.", gate: "flag", why: "AI can sound right and still be wrong." },
      { text: "Check every statistic against the original study.", gate: "good", why: "Verification is what makes your claims defensible." },
      { text: "Upload classmates’ survey answers, names included, to a chatbot.", gate: "flag", why: "Other people’s private data needs their consent and protection." },
      { text: "Ask the tool for counter-arguments to test your idea.", gate: "good", why: "Using AI to challenge your thinking makes the work stronger." },
      { text: "Let the tool pick your topic and write your conclusion.", gate: "flag", why: "The thinking and the decisions should be yours." },
      { text: "Keep a log of the prompts you tried and what changed.", gate: "good", why: "A log shows your process and helps you explain your choices." },
      { text: "Assume the sources it lists exist without opening them.", gate: "flag", why: "Tools can invent citations. Open every source." }
    ]
  }
];

export function missionFor(moduleId: string) {
  return missions.find((mission) => mission.moduleId === moduleId)!;
}
