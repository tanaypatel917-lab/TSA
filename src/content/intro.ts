export const introPalette = { ink: "#1C2A43", clay: "#DD8962", paper: "#F6EFE5", sky: "#AFCBE3", slate: "#4A6892", rust: "#B5502B" } as const;

export type IntroTone = "dark" | "light";
export type IntroLayout = "hero" | "left" | "right" | "center";
export type IntroActId = "start" | "questions" | "examples" | "prompts" | "proof" | "practice" | "finale";
export type IntroAct = { id: IntroActId; label: string; background: string; tone: IntroTone; layout: IntroLayout; title: string; lines?: [string, string]; text: string };

export const introActs: IntroAct[] = [
  { id: "start", label: "Start", background: introPalette.ink, tone: "dark", layout: "hero", title: "Follow the question.", text: "Six short scenes about how AI works, where it slips, and why your judgment still matters." },
  { id: "questions", label: "Questions", background: introPalette.ink, tone: "dark", layout: "right", title: "It starts with a question.", text: "AI gets less mysterious once you stop treating it like magic. Every answer it gives, right or wrong, starts with a question someone asked." },
  { id: "examples", label: "Examples", background: introPalette.clay, tone: "light", layout: "left", title: "Examples shape the answer.", text: "Models learn patterns from examples. Narrow examples produce narrow answers, and a model cannot tell you what it never saw." },
  { id: "prompts", label: "Prompts", background: introPalette.sky, tone: "light", layout: "right", title: "Better words make better tools.", text: "A prompt is a set of instructions, not a spell. Add the parts and watch a vague request turn into a useful one." },
  { id: "proof", label: "Proof", background: introPalette.paper, tone: "light", layout: "left", title: "Confidence is not proof.", text: "AI can sound certain and still be wrong. The habit that helps is simple: check the claim before you repeat it." },
  { id: "practice", label: "Practice", background: introPalette.ink, tone: "dark", layout: "right", title: "Try it. Break it. Improve it.", text: "Short activities turn ideas into habits: sort examples, rewrite prompts, weigh choices, and build a final project." },
  { id: "finale", label: "Your turn", background: introPalette.clay, tone: "light", layout: "center", title: "Ask better. Think further.", lines: ["Ask better.", "Think further."], text: "Your progress stays on this device. The lessons, activities, and quizzes are ready when you are." }
];

export const introQuestions = ["Is this true?", "Who made this?", "What is missing?", "Who does it affect?", "Can I check it?"];

export const introWallColors = [introPalette.ink, introPalette.paper, introPalette.sky, introPalette.slate];

export type IntroDataset = "varied" | "narrow";
export const introDatasets: { id: IntroDataset; label: string; status: string }[] = [
  { id: "varied", label: "Varied examples", status: "Varied examples: the answer can draw on many patterns." },
  { id: "narrow", label: "Narrow examples", status: "Narrow examples: every answer echoes the one pattern it saw." }
];

export type IntroPartId = "role" | "task" | "context" | "format" | "constraints";
export type IntroPromptPart = { id: IntroPartId; label: string; sentence: string; hint: string; color: string; tokens: number };

export const introPromptParts: IntroPromptPart[] = [
  { id: "role", label: "Role", sentence: "Act as a biology tutor.", hint: "Add a role so the tone fits the job.", color: introPalette.clay, tokens: 4 },
  { id: "task", label: "Task", sentence: "Explain photosynthesis.", hint: "Add a task so it knows what to do.", color: introPalette.ink, tokens: 5 },
  { id: "context", label: "Context", sentence: "The reader is a grade 10 student who missed the lab.", hint: "Add context so the answer fits the reader.", color: introPalette.paper, tokens: 6 },
  { id: "format", label: "Format", sentence: "Use five numbered steps.", hint: "Add a format so the answer is easy to use.", color: introPalette.slate, tokens: 4 },
  { id: "constraints", label: "Constraints", sentence: "Keep it under 120 words.", hint: "Add constraints so it stays focused.", color: introPalette.rust, tokens: 5 }
];

export const introAutoOrder: IntroPartId[] = ["task", "role", "context", "format", "constraints"];

export const introClaim = {
  answer: "Honey never spoils. Albert Einstein proved it in 1935.",
  checks: [
    { claim: "Sealed honey can last for decades.", verdict: "Supported", supported: true },
    { claim: "Einstein proved it in 1935.", verdict: "No source exists", supported: false }
  ],
  status: "Half right, fully confident. The honey part holds up. The Einstein part was invented."
};
