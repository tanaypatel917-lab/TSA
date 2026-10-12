export const detectorCopy = {
  title: "Can a detector really tell?",
  kicker: "Try it",
  spec: "Model: none, every score was written by us · Runs on your device",
  note: "OpenAI shut down its own AI-text classifier in 2023 because it was not accurate enough. Treat a detector score as a question, not proof.",
  scan: "Scan",
  point: "Every passage here was written by a person. A detector measures how text sounds, not who wrote it. A careful human writer can score as AI, and edited AI text can score as human.",
  talkHeading: "Talk about it",
  questions: [
    "Should a teacher fail someone based on this number?",
    "What else could show who did the work? (drafts, notes, a short conversation about it)"
  ],
  hoodIntro: "This detector is fake. Its scores were written by us to copy how real detectors behave: they guess from style, and style isn't proof."
} as const;

export const detectorPassages = [
  {
    id: "declaration",
    key: "Passage 1",
    text: "We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness. That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed.",
    score: 87,
    truth: "A person. It's the U.S. Declaration of Independence (1776), drafted by Thomas Jefferson.",
    signals: "Long, balanced sentences · formal words · no contractions"
  },
  {
    id: "science-fair",
    key: "Passage 2",
    text: "ok so my science fair project was about whether plants grow better with music. spoiler: they kinda did?? the basil with music grew 2 cm more but i only had 4 plants so idk if it counts.",
    score: 12,
    truth: "A person: our team wrote it in a casual student voice.",
    signals: "Lowercase and slang (kinda, idk) · uneven sentences · a personal doubt"
  },
  {
    id: "photosynthesis",
    key: "Passage 3",
    text: "Photosynthesis is a fascinating process that plays a crucial role in sustaining life on Earth. Furthermore, it seamlessly converts sunlight into chemical energy, highlighting the intricate balance of nature.",
    score: 91,
    truth: "A person on our team, copying the style chatbots often use.",
    signals: "Stock phrases (fascinating, crucial, furthermore, seamlessly) · even rhythm"
  }
] as const;

export type DetectorPassage = (typeof detectorPassages)[number];
export type DetectorPassageId = DetectorPassage["id"];

export function detectorScoreLabel(score: number): string {
  return score >= 50 ? "HIGH CONFIDENCE · LIKELY AI" : "LIKELY HUMAN";
}
