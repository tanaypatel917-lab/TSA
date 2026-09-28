export type BigIdea = { id: number; name: string; text: string };

export const bigIdeas: BigIdea[] = [
  { id: 1, name: "Perception", text: "Computers perceive the world using sensors." },
  { id: 2, name: "Representation & reasoning", text: "AI systems keep representations of the world and use them to reason." },
  { id: 3, name: "Learning", text: "Computers can learn from data." },
  { id: 4, name: "Natural interaction", text: "Making AI interact naturally with people is hard, and it shapes how tools respond." },
  { id: 5, name: "Societal impact", text: "AI can affect society in both positive and negative ways." }
];

export type WorksheetItem = { lessonId: string; question: string; answer: string };
export type ChapterPlan = { moduleId: string; bigIdeas: number[]; warmup: string; discussion: [string, string, string]; activityTips: [string, string]; extension: string; worksheet: WorksheetItem[] };

export const PLAN_MINUTES = { warmup: 5, activity: 10, discussion: 10, quiz: 5, period: 45 };

export const chapterPlans: ChapterPlan[] = [
  {
    moduleId: "foundations",
    bigIdeas: [2, 3, 5],
    warmup: "Ask: what happens inside an AI tool when you type a question? Students write one guess and revisit it at the end.",
    discussion: [
      "A spam filter and a chatbot are both called AI. What makes them different, and why does the task matter more than the label?",
      "Why can a model that learned from examples fail in a new situation? Give an example from your own life.",
      "When would you trust an AI answer without checking, and when would you always check? Who should decide?"
    ],
    activityTips: [
      "Before the message classifier, have students predict which clue words the model will learn, then compare with the results table.",
      "Pair students: one sorts, the other explains each label aloud."
    ],
    extension: "Run the fruit-sorter bias lab with 0% and then 50% Farm B photos, and write two sentences explaining the accuracy gap.",
    worksheet: [
      { lessonId: "what-is-ai", question: "Name two ways an AI system is different from a person.", answer: "It has no feelings, personal experiences or human common sense, and it can sound confident without knowing whether a claim is true." },
      { lessonId: "rules-and-learning", question: "What is the difference between a rules-based program and machine learning?", answer: "People write rules directly; machine learning adjusts internal numbers after seeing labeled examples." },
      { lessonId: "rules-and-learning", question: "Give one reason learning from examples can fail.", answer: "The data is too small, contains mistakes, or represents only one group of people." },
      { lessonId: "language-models", question: "What is a token, and what does a language model do with tokens?", answer: "A small piece of text (a short word, part of a word or punctuation). The model uses earlier tokens to calculate likely next tokens." },
      { lessonId: "data-and-bias", question: "How can a model become biased even if no programmer intended it?", answer: "It repeats unfair patterns in its training data, like a hiring model trained on a narrow past workforce." },
      { lessonId: "strengths-and-limits", question: "What is a hallucination, and how should checking match the stakes?", answer: "A made-up answer presented as true. Check brainstorms lightly, check science claims against trusted sources, and ask an adult before relying on health, safety or money advice." }
    ]
  },
  {
    moduleId: "tools",
    bigIdeas: [3, 4],
    warmup: "Show the prompt “Help me with history.” Ask: what would you need to know to actually help? List the missing details.",
    discussion: [
      "In the prompt builder, which part (role, task, context, format or limits) changed the answer most? Why?",
      "What does verifying an AI answer look like in math, in history and in science?",
      "Where is the line between getting help from AI and letting it do the thinking an assignment measures?"
    ],
    activityTips: [
      "In the prompt lab, have students swap rewritten prompts and score each other with the rubric before checking.",
      "Ask each student to keep one prompt they improved and explain what changed."
    ],
    extension: "Use “Ask the same question three times” at low and high creativity, and discuss why every version still needs checking.",
    worksheet: [
      { lessonId: "prompt-anatomy", question: "List the parts of a useful prompt.", answer: "A role when it helps, a clear task, context, a format, and constraints such as length or reading level." },
      { lessonId: "prompt-anatomy", question: "Why should you treat the first response as a draft?", answer: "A prompt is not magic language. You compare the result with your needs and improve the instruction." },
      { lessonId: "iterate-verify", question: "What does verification mean?", answer: "Checking important claims against reliable sources, class materials or a calculation you can reproduce." },
      { lessonId: "study-tools", question: "Why can asking for the final answer first teach less?", answer: "Hints, simpler examples and questions that check understanding keep you doing the thinking." },
      { lessonId: "creative-and-coding-tools", question: "Name the right tool for exact arithmetic, for a quotation, and for a decision where a mistake could cause harm.", answer: "A calculator, the source document, and a human expert." },
      { lessonId: "when-not-to-use", question: "Name two kinds of information you should never paste into an AI tool.", answer: "Any two of: passwords, medical details, private messages, identifying information." }
    ]
  },
  {
    moduleId: "ethics",
    bigIdeas: [5],
    warmup: "Quick vote: is using AI for homework cheating? Record the result and revisit it after the lessons.",
    discussion: [
      "Write a one-sentence disclosure note for a time you might use AI in class. What does it need to include?",
      "A system is 95% accurate overall. What should you ask next, and why?",
      "Who pays the costs of AI (energy, water, human labelers), and who gets the benefits?"
    ],
    activityTips: [
      "In “Make the responsible call”, ask students to defend an answer to someone it affects before revealing the feedback.",
      "Use the privacy redactor as a whole-class warm-up: students call out each detail to remove."
    ],
    extension: "Pick a viral claim or image and judge it with the SIFT moves: stop, investigate the source, find better coverage, trace it to the original.",
    worksheet: [
      { lessonId: "academic-integrity", question: "What should a short AI disclosure note say?", answer: "Which tool you used, what it helped with, and what you changed or verified." },
      { lessonId: "fairness", question: "Why can a high accuracy number be misleading?", answer: "It can hide poor results for a smaller group." },
      { lessonId: "privacy", question: "List three kinds of personal data.", answer: "Any three of: names, locations, contact details, health information, school records, faces, messages." },
      { lessonId: "misinformation", question: "Name three things to check before trusting a surprising video or headline.", answer: "Any three of: the original source, the date, supporting evidence, independent reporting." },
      { lessonId: "impact", question: "Name two costs of AI beyond money.", answer: "Electricity and water for data centers, and the work of people who label data or moderate content." },
      { lessonId: "impact", question: "Name one way to reduce AI’s impact.", answer: "Smaller tools, shorter prompts, reusing results, or a human method." }
    ]
  },
  {
    moduleId: "real-world",
    bigIdeas: [1, 5],
    warmup: "Ask: name a job you might want. Which tasks could AI help with, and which need a person?",
    discussion: [
      "In medicine, why can both false reassurance and missed warnings cause harm?",
      "A flood model worked well in the past. Why might it become less reliable as the climate changes?",
      "How should a creator label work that used AI, and why does it matter to the audience?"
    ],
    activityTips: [
      "For the case-study field notes, give each small group one case and have them report the human role they found.",
      "Ask students to connect each case to one lesson and one source on the References page."
    ],
    extension: "Interview an adult about how their job uses or avoids AI, and write a paragraph on which skills stayed human.",
    worksheet: [
      { lessonId: "careers", question: "Does AI usually replace whole jobs? Explain.", answer: "More often it changes tasks inside jobs, while people keep the goals, judgment and communication." },
      { lessonId: "careers", question: "Name two future-ready skills.", answer: "Any two of: asking good questions, checking evidence, explaining choices, working with people, learning new tools." },
      { lessonId: "medicine", question: "Why does medical AI need qualified people and clear limits?", answer: "False reassurance and missed warnings can both harm patients, so tools support but do not replace clinical responsibility." },
      { lessonId: "climate", question: "What does a climate model’s prediction depend on?", answer: "The sensors, historical records and assumptions behind it." },
      { lessonId: "creative-fields", question: "What stays human in creative work that uses AI?", answer: "The creative purpose, the selection and the final choices." },
      { lessonId: "keep-learning", question: "When a tool fails, what four causes should you consider?", answer: "The data, the prompt, the task, or the tool itself." }
    ]
  },
  {
    moduleId: "capstone",
    bigIdeas: [3, 5],
    warmup: "Ask: what is one problem at school you would like to improve, and who would benefit?",
    discussion: [
      "What should stay yours in a school project, even if AI could help?",
      "Who could give you feedback because your project affects them?",
      "What would make you pause or stop your project? Write your stop rule."
    ],
    activityTips: [
      "Have students draft the plan in pairs, then swap with another pair to check that the AI role is narrow and testable.",
      "Collect plans as printouts; drafts stay on each student’s device."
    ],
    extension: "Test the plan with two classmates and revise one step based on their feedback.",
    worksheet: [
      { lessonId: "project-brief", question: "What three things should a project goal describe?", answer: "What you want to improve, who benefits, and how you will know it helped." },
      { lessonId: "project-brief", question: "Why give AI a narrow role?", answer: "A narrow role is easier to check than asking it to do everything." },
      { lessonId: "project-brief", question: "What should you record while you work?", answer: "The prompt, the output, your checks and your revisions." },
      { lessonId: "responsible-launch", question: "What should you test for before sharing a result?", answer: "Errors, unfair assumptions, privacy risks and confusing instructions." },
      { lessonId: "responsible-launch", question: "What should a reader be able to tell apart in your project?", answer: "Which parts are evidence, which are your choices, and which were assisted." },
      { lessonId: "responsible-launch", question: "What is a stop rule?", answer: "A plan to pause, revise or switch to a non-AI approach if the project causes harm or can’t be verified." }
    ]
  }
];

export const policyOptions = {
  allowed: ["Brainstorming ideas before I write", "Explaining a concept I’m stuck on", "Making practice questions", "Checking spelling and grammar in my own draft", "Getting feedback on work I wrote"],
  notAllowed: ["Writing work I hand in as my own", "Answering quiz or test questions", "Pasting anyone’s private information", "Making up sources or quotations", "Any use on assignments marked “independent”"],
  disclosure: "I used [tool] to [purpose]. I changed [what] and checked [what] against [source]."
};
