export type TimelineEntry = {
  year: number | "Next";
  sentence: string;
  why?: string;
  refId?: string;
  lesson?: { href: string; label: string };
};

export type TimelineEra = {
  id: "past" | "now" | "next";
  title: string;
  entries: TimelineEntry[];
};

export const timelineEras: TimelineEra[] = [
  {
    id: "past",
    title: "Past",
    entries: [
      { year: 1950, sentence: "Alan Turing asks: can machines think?", why: "He proposed a test: could a machine's typed answers pass for a person's?", refId: "turing-1950" },
      { year: 1956, sentence: "A summer workshop at Dartmouth names the field “artificial intelligence.”", why: "The 1955 proposal guessed a small team could make real progress in one summer. It took decades.", refId: "dartmouth-1955" },
      { year: 1966, sentence: "A program called ELIZA convinces people it understands them.", why: "It only matched keywords to written replies.", refId: "weizenbaum-1966", lesson: { href: "/modules/ai-foundations/lessons/rules-and-learning/", label: "Meet Pip →" } },
      { year: 1997, sentence: "IBM's Deep Blue beats world chess champion Garry Kasparov.", why: "Brute-force search, not understanding, won the match.", refId: "ibm-deep-blue-2025" },
      { year: 2012, sentence: "A neural network called AlexNet wins an image-recognition contest by a wide margin.", why: "It kicked off the deep-learning boom: models that learn patterns from huge numbers of examples.", refId: "krizhevsky-2012" },
      { year: 2017, sentence: "Google researchers publish the transformer, the design most chatbots use today.", why: "It predicts the next token by weighing every earlier word.", refId: "vaswani-2017", lesson: { href: "/modules/ai-foundations/lessons/language-models/", label: "See next-word prediction →" } }
    ]
  },
  {
    id: "now",
    title: "Now",
    entries: [
      { year: 2022, sentence: "ChatGPT launches in November and puts a chatbot in millions of students' hands.", why: "Fluent answers are not always true answers.", refId: "openai-chatgpt-2022", lesson: { href: "/modules/ai-foundations/lessons/strengths-and-limits/", label: "Explore strengths and limits →" } },
      { year: 2023, sentence: "OpenAI shuts down its own AI-text detector because it isn't accurate enough.", refId: "openai-classifier-2023", lesson: { href: "/modules/ethical-ai/lessons/academic-integrity/", label: "Try the detector →" } },
      { year: 2024, sentence: "The European Union passes the AI Act, the first broad law for AI.", why: "It sorts AI uses by risk and bans some outright.", refId: "eu-ai-act-2024" }
    ]
  },
  {
    id: "next",
    title: "Next",
    entries: [
      { year: "Next", sentence: "Who checks the answers?", why: "As AI writes more of what we read, checking sources matters more.", lesson: { href: "/modules/ethical-ai/lessons/misinformation/", label: "Spot the fake page →" } },
      { year: "Next", sentence: "Whose data is it?", why: "Every model learned from people's examples. Who should be asked first?", lesson: { href: "/modules/ethical-ai/lessons/fairness/", label: "Meet the models →" } },
      { year: "Next", sentence: "What will you build?", why: "The next part of the timeline is yours.", lesson: { href: "/modules/capstone/lessons/project-brief/", label: "Start a project →" } }
    ]
  }
];
