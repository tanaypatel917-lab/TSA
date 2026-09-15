export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  body: string[];
  keyTakeaways: string[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
};

export type Activity =
  | { kind: "classifier"; id: string; title: string; intro: string; items: { text: string; label: "spam" | "not-spam" }[] }
  | { kind: "prompt-lab"; id: string; title: string; intro: string; weakPrompt: string; rubric: { id: string; label: string; keywords: string[] }[] }
  | { kind: "scenarios"; id: string; title: string; intro: string; scenarios: { id: string; situation: string; options: { text: string; ok: boolean; feedback: string }[] }[] }
  | { kind: "case-studies"; id: string; title: string; intro: string; cases: { id: string; title: string; summary: string; reflection: string }[] }
  | { kind: "capstone"; id: string; title: string; intro: string; steps: { id: string; prompt: string; placeholder: string }[] };

export type Module = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  color: string;
  icon: string;
  lessons: Lesson[];
  activity: Activity;
  quiz: QuizQuestion[];
};
