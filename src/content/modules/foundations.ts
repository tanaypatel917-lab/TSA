import type { Module } from "../types";

export const foundations: Module = {
  id: "foundations",
  slug: "ai-foundations",
  title: "AI Foundations",
  tagline: "Build a clear mental model before you build with AI.",
  color: "sky",
  icon: "🧭",
  lessons: [
    {
      id: "what-is-ai",
      title: "What AI is (and is not)",
      minutes: 7,
      body: [
        "Artificial intelligence is a broad name for computer systems that perform tasks we associate with human thinking, such as recognizing patterns, understanding language, or choosing an action. A calculator follows instructions, while an AI model can learn a useful pattern from many examples.",
        "AI is not a tiny person inside a computer. It does not have feelings, personal experiences, or common sense in the human way. A system can sound confident while having no idea whether a claim is true.",
        "The word AI covers many approaches. A spam filter, a route planner, a voice assistant, and a game opponent may use different models and different data. Asking what task a system is designed for is more useful than asking whether it is simply smart.",
        "Good AI literacy means noticing both capability and context. A tool can be excellent at sorting thousands of images and still be a poor choice for a high-stakes decision without human review."
      ],
      keyTakeaways: ["AI is a family of pattern-based tools, not a digital person.", "Different tasks need different systems and data.", "Human judgment remains important, especially for high-stakes choices."]
    },
    {
      id: "rules-and-learning",
      title: "Rules versus machine learning",
      minutes: 8,
      body: [
        "A rules-based program uses instructions written by people. For example, a school website might show a late warning when a date is before today. The rule is visible and predictable, but a human must anticipate the cases.",
        "Machine learning lets a program adjust internal numbers after seeing examples. A team can show a model many messages labeled spam or not-spam, then test whether it recognizes patterns in new messages.",
        "Learning from examples is powerful when the examples resemble the future. It can fail when the data is too small, contains mistakes, or represents only one group of people. More data is not automatically better data.",
        "Many real products combine both approaches. A model may suggest a result while rules enforce safety limits. Understanding this mix helps you ask where a decision came from and who can correct it."
      ],
      keyTakeaways: ["Rules are written directly; models learn patterns from examples.", "Training examples shape what a model recognizes.", "Reliable systems often combine learned predictions with human-written rules."]
    },
    {
      id: "language-models",
      title: "How language models predict text",
      minutes: 8,
      body: [
        "A large language model, or LLM, reads text as small pieces called tokens. A token might be a whole short word, part of a longer word, or punctuation. The model uses the earlier tokens as context and calculates likely next tokens.",
        "For example, after “The dog chased the,” words such as “ball” may be more likely than “calendar.” The model repeats this next-token process many times to create a response. It is generating a likely continuation, not retrieving a guaranteed answer.",
        "During training, the model adjusts many numerical settings so its predictions match patterns in a large collection of text. Later, additional training and human feedback can make responses more helpful or safer.",
        "Fluent language can hide uncertainty. The model may connect familiar patterns into a sentence that sounds reasonable but is unsupported. Treat an LLM as a drafting partner whose work needs checking."
      ],
      keyTakeaways: ["LLMs generate text one token at a time.", "A likely continuation is not the same as a verified fact.", "Clear context and careful checking improve responsible use."]
    },
    {
      id: "data-and-bias",
      title: "Training data and bias",
      minutes: 8,
      body: [
        "Training data is the collection of examples used to shape a model. It can include writing, images, measurements, or labeled decisions. The sources, labels, and gaps in that collection affect what the model learns.",
        "Bias is a repeated pattern that treats people or ideas unfairly. A model can repeat bias found in its data even when no programmer intended that result. For example, a hiring model trained on a narrow past workforce may favor the same narrow path.",
        "Fairness is not solved by one magic test. Teams should check performance across groups, involve people affected by the system, document limitations, and provide ways to appeal a harmful decision.",
        "When you use an AI tool, ask whose voices are represented, what may be missing, and who bears the risk of an error. These questions turn vague concern into practical evaluation."
      ],
      keyTakeaways: ["Data choices influence model behavior.", "Bias can be inherited from past patterns and labels.", "Fair systems need testing, participation, documentation, and appeals."]
    },
    {
      id: "strengths-and-limits",
      title: "Strengths, limits, and hallucinations",
      minutes: 7,
      body: [
        "AI tools are useful for spotting patterns, offering many draft ideas, translating between formats, and handling repetitive work. They can help a student compare explanations or make a first practice quiz.",
        "A hallucination is a made-up answer presented as if it were true. Language models can invent sources, names, dates, or quotations because their main goal is producing plausible text, not proving each sentence.",
        "Verification should match the stakes. Check a fun brainstorm lightly, but check a science claim against a trusted source and ask a teacher before relying on advice about health, safety, or money.",
        "The strongest workflow gives AI a limited role: define the goal, ask for a draft, inspect the result, correct it, and take responsibility for what you submit. You are the decision-maker."
      ],
      keyTakeaways: ["AI is strong at patterns and drafts.", "Hallucinations are plausible-sounding inventions.", "The user is responsible for checking and using an output."]
    }
  ],
  activity: {
    kind: "classifier",
    id: "spam-sort",
    title: "Train a tiny message classifier",
    intro: "Label each message as spam or not-spam. Notice which clues help and which could fool a real system.",
    items: [
      { text: "Your library book is ready for pickup at the front desk.", label: "not-spam" },
      { text: "WIN a free phone now!!! Click this strange link.", label: "spam" },
      { text: "Can you send me the homework photo before class?", label: "not-spam" },
      { text: "Urgent: claim your cash prize by sharing your password.", label: "spam" },
      { text: "Reminder: soccer practice moved to 4:30 today.", label: "not-spam" },
      { text: "You have been selected for a secret investment opportunity.", label: "spam" },
      { text: "The bus is running ten minutes late.", label: "not-spam" },
      { text: "Congratulations!!! You earned a gift card. Pay shipping first.", label: "spam" },
      { text: "Please review the group project outline tonight.", label: "not-spam" },
      { text: "Your account will close unless you verify at this link.", label: "spam" },
      { text: "Happy birthday! See you at the movie theater.", label: "not-spam" },
      { text: "Limited offer: buy followers with guaranteed results.", label: "spam" }
    ],
    clues: [
      { label: "Pressure to act fast", pattern: "\\b(urgent|now|limited|unless|selected)\\b" },
      { label: "Money or prizes", pattern: "\\b(win|cash|prize|gift|free|investment|buy|pay)\\b" },
      { label: "Asks for secrets", pattern: "\\b(password|verify|account)\\b" },
      { label: "A link to click", pattern: "\\blink\\b" },
      { label: "Exclamation marks", pattern: "!{2,}" },
      { label: "Everyday plans", pattern: "\\b(practice|homework|project|library|bus|birthday|class|movie)\\b" }
    ]
  },
  quiz: [
    { id: "f1", prompt: "Which description best fits AI?", choices: ["A digital person with feelings", "A family of systems that find patterns or perform tasks", "Any program with a screen", "A perfect source of facts"], answerIndex: 1, explanation: "AI describes many task-focused systems; it does not imply feelings or perfect knowledge." },
    { id: "f2", prompt: "What does a machine-learning model learn from?", choices: ["Only handwritten rules", "Examples and patterns in data", "A human's memories", "A permanent list of answers"], answerIndex: 1, explanation: "Machine learning adjusts itself using examples, though people still choose data and goals." },
    { id: "f3", prompt: "What does an LLM usually predict next?", choices: ["A verified fact", "A likely token given the context", "The user's feelings", "The future"], answerIndex: 1, explanation: "An LLM generates likely next tokens. That process can produce fluent but incorrect claims." },
    { id: "f4", prompt: "Why can training data create bias?", choices: ["Data has no effect", "The data may repeat gaps or unfair past patterns", "Models dislike numbers", "Bias only comes from keyboards"], answerIndex: 1, explanation: "A model can reproduce patterns in its sources, labels, or missing representation." },
    { id: "f5", prompt: "What is a good response to a possible hallucination?", choices: ["Share it immediately", "Verify it with trusted sources", "Assume confidence means truth", "Delete every AI tool"], answerIndex: 1, explanation: "Verification should match the stakes; important claims need trusted evidence." }
  ]
};
