import type { Module } from "../types";

const lesson = (id: string, title: string, body: string[]): { id: string; title: string; minutes: number; body: string[]; keyTakeaways: string[] } => ({
  id, title, minutes: 7, body, keyTakeaways: body.slice(0, 3).map((paragraph) => paragraph.split(".")[0] + ".")
});

export const tools: Module = {
  id: "tools",
  slug: "ai-tools",
  title: "AI Tools & Techniques",
  tagline: "Ask better questions, test the answer, and choose the right tool.",
  color: "indigo",
  icon: "🛠️",
  lessons: [
    lesson("prompt-anatomy", "The anatomy of a useful prompt", [
      "A prompt is the instruction or question you give an AI tool. A useful prompt gives the tool enough information to aim at the right result instead of guessing your goal.",
      "Start with a role when it helps, such as “act as a patient algebra tutor.” State the task clearly, then add context like your grade, what you already understand, or the text you are studying.",
      "Ask for a format that fits your purpose: a table, a short explanation, flashcards, or a checklist. Constraints such as word count, reading level, or “show your assumptions” make the result easier to review.",
      "A prompt is not magic language. Plain, specific directions work well. Treat the first response as a draft and improve the instruction when it misses your needs."
    ]),
    lesson("iterate-verify", "Iterate and verify", [
      "Strong users do not expect one prompt to solve everything. They compare the result with their goal, identify a weak spot, and ask a focused follow-up instead of starting over blindly.",
      "Verification means checking important claims against reliable sources, class materials, or a calculation you can reproduce. Ask the tool to show assumptions, but remember that a confident explanation is not proof.",
      "You can improve a response by supplying an example of the style you want, breaking a large task into steps, or asking for two different approaches. Save the version that you can explain yourself.",
      "For schoolwork, use AI to practice and get feedback, not to hide who did the thinking. Your notes should show your own understanding and your teacher's rules should guide your use."
    ]),
    lesson("study-tools", "AI as a study partner", [
      "A student can paste their own notes and ask for a short summary, a concept map, or flashcards. The student should compare the result with the original notes so an important detail is not lost.",
      "A tutoring prompt can ask for one hint at a time, a simpler example, or a question that checks understanding. Asking for the final answer first may feel fast but teaches less.",
      "AI can also create practice questions at different difficulty levels. Mark which answers you know, then revisit the topics you missed with a textbook or teacher.",
      "Never paste private records, classmates' information, or an assignment that your teacher says must be independent. When unsure, ask the teacher before using a tool."
    ]),
    lesson("creative-and-coding-tools", "Coding, data, and image tools", [
      "Coding assistants can explain an error, suggest a small function, or generate test cases. Read every line, run it safely, and credit assistance when your course requires it.",
      "For data work, AI can help describe a chart or suggest a way to clean a table. It may misunderstand units or invent a pattern, so inspect the data and calculate key results yourself.",
      "Image tools can brainstorm compositions or make a rough concept. Check licenses, avoid copying a living artist's style when a project rule forbids it, and label generated work honestly.",
      "A tool should fit the task. Use a calculator for exact arithmetic, a source document for a quotation, and a human expert for decisions where a mistake could cause harm."
    ]),
    lesson("when-not-to-use", "Knowing when not to use AI", [
      "Do not use AI to impersonate someone, submit work that is meant to show only your thinking, or make a decision about another person without a fair process.",
      "Avoid sharing passwords, medical details, private messages, or identifying information. Even a free tool may store prompts or use them to improve a service.",
      "Do not use an unverified answer for safety, legal, health, or financial advice. A polished response can be wrong in ways that are hard to notice.",
      "Choosing not to use AI is a real skill. Sometimes the best method is a conversation with a teacher, a library source, a calculator, or your own first attempt."
    ])
  ],
  activity: {
    kind: "prompt-lab", id: "prompt-lab", title: "Prompt lab", intro: "Improve a vague prompt. Include at least four parts of the rubric in your rewrite.",
    weakPrompt: "Tell me about climate change for school.",
    rubric: [
      { id: "role", label: "Role", keywords: ["tutor", "teacher", "scientist", "coach", "expert"] },
      { id: "task", label: "Task", keywords: ["explain", "compare", "summarize", "create", "describe", "teach"] },
      { id: "context", label: "Context", keywords: ["grade", "class", "student", "notes", "project", "climate"] },
      { id: "format", label: "Format", keywords: ["bullet", "table", "paragraph", "outline", "flashcard", "steps"] },
      { id: "constraints", label: "Constraints", keywords: ["word", "simple", "source", "cite", "brief", "limit"] }
    ]
  },
  quiz: [
    { id: "t1", prompt: "Which prompt detail gives the model background information?", choices: ["Context", "Emoji", "Password", "Randomness"], answerIndex: 0, explanation: "Context explains the situation, audience, or material the tool should use." },
    { id: "t2", prompt: "Why should you verify an AI response?", choices: ["It is always encrypted", "It can sound right while being wrong", "Verification makes it longer", "AI cannot write sentences"], answerIndex: 1, explanation: "AI tools can produce fluent errors, so important claims need evidence." },
    { id: "t3", prompt: "Which study use supports learning best?", choices: ["Ask for the answer and submit it", "Ask for one hint and explain your own next step", "Paste a friend's private notes", "Skip your own attempt"], answerIndex: 1, explanation: "Hints and practice preserve the student's thinking." },
    { id: "t4", prompt: "What should you do with generated code?", choices: ["Run it without reading", "Read, test, and understand it", "Assume it has no bugs", "Hide its use"], answerIndex: 1, explanation: "Generated code can contain errors or unsafe assumptions." },
    { id: "t5", prompt: "When is avoiding AI the responsible choice?", choices: ["When the task requires independent work", "Whenever a screen is nearby", "Only on weekends", "When you want a shorter prompt"], answerIndex: 0, explanation: "Course rules and privacy or safety concerns can make non-use the right choice." }
  ]
};
