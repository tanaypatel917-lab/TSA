import type { Module } from "../types";

export const tools: Module = {
  id: "tools",
  slug: "ai-tools",
  title: "AI Tools & Techniques",
  tagline: "Ask better questions, test the answer, and choose the right tool.",
  color: "indigo",
  icon: "🛠️",
  lessons: [
    {
      id: "prompt-anatomy",
      title: "The anatomy of a useful prompt",
      minutes: 8,
      body: [
        "A prompt is the instruction or question you give an AI tool. A useful prompt gives the tool enough information to aim at the right result instead of guessing your goal. The same tool can respond very differently to a vague request and a focused one. Your goal gives the response a direction.",
        "Start with a role when it helps, such as “act as a patient algebra tutor.” State the task clearly, then add context like your grade, what you already understand, or the text you are studying. Context tells the model which background matters. It can prevent a response from being too advanced or too general.",
        "Ask for a format that fits your purpose: a table, a short explanation, flashcards, or a checklist. Constraints such as word count, reading level, or “show your assumptions” make the result easier to review. They also make it easier to notice when the response misses the assignment.",
        "A prompt can include an example of the kind of answer you want. For instance, you can show one flashcard with a question on one line and an answer on the next. Examples guide style without replacing your need to check the content.",
        "A prompt is not magic language. Plain, specific directions work well. Treat the first response as a draft and improve the instruction when it misses your needs. Clear revision is part of using the tool well."
      ],
      keyTakeaways: ["A useful prompt gives an AI tool a clear task and relevant context.", "Formats, constraints, and examples make responses easier to review.", "The first response is a draft that may need a better prompt."]
    },
    {
      id: "iterate-verify",
      title: "Iterate and verify",
      minutes: 9,
      body: [
        "Strong users do not expect one prompt to solve everything. They compare the result with their goal, identify a weak spot, and ask a focused follow-up instead of starting over blindly. This cycle is called iteration. Small changes can reveal which instruction mattered.",
        "Verification means checking important claims against reliable sources, class materials, or a calculation you can reproduce. Ask the tool to show assumptions, but remember that a confident explanation is not proof. A source link also needs checking because a model can invent a citation.",
        "You can improve a response by supplying an example of the style you want, breaking a large task into steps, or asking for two different approaches. Save the version that you can explain yourself. If you cannot explain a result, you have not finished reviewing it.",
        "A useful check looks for both errors and missing information. A map route planner may miss a closed road, and a recommendation system may keep showing familiar choices while hiding new ones. Compare the output with another source or with what you observe.",
        "For schoolwork, use AI to practice and get feedback, not to hide who did the thinking. Your notes should show your own understanding and your teacher's rules should guide your use. Responsible use protects both learning and trust."
      ],
      keyTakeaways: ["Iteration improves a response through focused follow-up questions.", "Verification requires evidence, not just a confident explanation.", "You should be able to explain and take responsibility for the result."]
    },
    {
      id: "study-tools",
      title: "AI as a study partner",
      minutes: 8,
      body: [
        "A student can paste their own notes and ask for a short summary, a concept map, or flashcards. The student should compare the result with the original notes so an important detail is not lost. A summary is a study aid, not a replacement for the source.",
        "A tutoring prompt can ask for one hint at a time, a simpler example, or a question that checks understanding. Asking for the final answer first may feel fast but teaches less. Asking the chatbot to wait for your attempt keeps you involved.",
        "AI can also create practice questions at different difficulty levels. Mark which answers you know, then revisit the topics you missed with a textbook or teacher. Check that the questions match what your class is actually learning.",
        "Translation apps can help you compare words or practice a conversation, but they may miss tone, idioms, or important details. Read the original when possible and ask a fluent speaker or teacher about a confusing translation. This is especially important for a graded assignment.",
        "Never paste private records, classmates' information, or an assignment that your teacher says must be independent. When unsure, ask the teacher before using a tool. A quick question can prevent a larger problem later."
      ],
      keyTakeaways: ["AI can turn your own notes into practice materials that still need checking.", "Hints and explanations support learning better than copying final answers.", "Privacy, translation limits, and class rules should guide study-tool use."]
    },
    {
      id: "creative-and-coding-tools",
      title: "Coding, data, and image tools",
      minutes: 9,
      body: [
        "Coding assistants can explain an error, suggest a small function, or generate test cases. Read every line, run it safely, and credit assistance when your course requires it. A suggestion is not automatically correct or secure. Test unusual inputs as well as the easy example.",
        "For data work, AI can help describe a chart or suggest a way to clean a table. It may misunderstand units or invent a pattern, so inspect the dataset and calculate key results yourself. Keep the original data so you can compare changes.",
        "Image tools can brainstorm compositions or make a rough concept. Image generators create synthetic media, so label generated work honestly and avoid presenting it as a photograph or hand-drawn original. Check project rules and permissions before sharing.",
        "Computer vision tools can find objects in a picture or group similar photos, but they can miss people or details. A face-grouping feature is convenient, yet you should review its suggestions before deleting, sharing, or labeling family photos. People deserve a chance to correct an incorrect label.",
        "A tool should fit the task. Use a calculator for exact arithmetic, a source document for a quotation, and a human expert for decisions where a mistake could cause harm. Choosing a simpler method can make the result easier to verify."
      ],
      keyTakeaways: ["Generated code, data suggestions, and images all require human review.", "Synthetic media should be labeled and used with permission.", "Choose a tool that fits the task and the risk of an error."]
    },
    {
      id: "when-not-to-use",
      title: "Knowing when not to use AI",
      minutes: 8,
      body: [
        "Do not use AI to impersonate someone, submit work that is meant to show only your thinking, or make a decision about another person without a fair process. Convenience does not override consent or academic integrity. A fast result can still be an irresponsible result.",
        "Avoid sharing passwords, medical details, private messages, or identifying information. Even a public chatbot may store prompts or use them to improve a service. Remove names and other details when a task can be completed with fictional examples.",
        "Prompt injection is an instruction hidden in content that tries to make a tool ignore its original task. For example, a document could tell a summarizer to reveal private notes instead of summarizing. Keep sensitive actions separate and review unexpected instructions.",
        "Do not use an unverified answer for safety, legal, health, or financial advice. A polished response can be wrong in ways that are hard to notice. In those situations, involve a qualified person and use trustworthy sources.",
        "Choosing not to use AI is a real skill. Sometimes the best method is a conversation with a teacher, a library source, a calculator, or your own first attempt. Good judgment includes knowing when a tool adds no real value."
      ],
      keyTakeaways: ["Privacy, consent, and academic integrity can make non-use the responsible choice.", "Prompt injection is a reason to treat outside instructions with caution.", "High-stakes questions need qualified people and verified sources."]
    }
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
    { id: "t5", prompt: "When is avoiding AI the responsible choice?", choices: ["When the task requires independent work", "Whenever a screen is nearby", "Only on weekends", "When you want a shorter prompt"], answerIndex: 0, explanation: "Course rules and privacy or safety concerns can make non-use the right choice." },
    { id: "t6", prompt: "Which detail can make a prompt easier to review?", choices: ["A clear output format", "A private password", "A hidden instruction", "No task at all"], answerIndex: 0, explanation: "A requested format such as a table or checklist makes the response easier to inspect." },
    { id: "t7", prompt: "What should you do with a translation used for an important message?", choices: ["Send it without reading", "Ask a fluent speaker or teacher to review it", "Delete the original", "Make it more dramatic"], answerIndex: 1, explanation: "Human review can catch missing context, tone, or meaning in a translation." },
    { id: "t8", prompt: "What is prompt injection?", choices: ["A hidden instruction that tries to redirect a tool", "A type of camera lens", "A verified source", "A study schedule"], answerIndex: 0, explanation: "Prompt injection attempts to make a tool ignore its original task or reveal information." }
  ]
};
