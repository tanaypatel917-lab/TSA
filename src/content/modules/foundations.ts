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
      minutes: 8,
      body: [
        "Artificial intelligence is a broad name for computer systems that perform tasks we associate with human thinking, such as recognizing patterns, understanding language, or choosing an action. A calculator follows instructions, while an AI model can learn a useful pattern from many examples. The word describes a capability, not one single machine.",
        "AI is not a tiny person inside a computer. It does not have feelings, personal experiences, or common sense in the human way. A system can sound confident while having no idea whether a claim is true.",
        "The word AI covers many approaches. A spam filter, a route planner, a voice assistant, and a game opponent may use different models and different data. Asking what task a system is designed for is more useful than asking whether it is simply smart.",
        "Many familiar tools use narrow AI for one job. Email autocomplete predicts a possible ending, a recommendation system ranks videos or songs, and a photo app groups faces that seem to belong together. Each tool can be useful without understanding the whole world.",
        "AI systems also depend on an algorithm, which is a method for turning inputs into outputs. The method may include a learned model, written rules, or both. Looking at the inputs, output, and purpose helps you ask better questions about any system.",
        "Good AI literacy means noticing both capability and context. A tool can be excellent at sorting thousands of images and still be a poor choice for a high-stakes decision without human review. Always connect a tool to the situation in which it is being used."
      ],
      keyTakeaways: ["AI is a family of systems that perform specific tasks, not a digital person.", "Different tasks need different models, data, and algorithms.", "Human judgment remains important, especially for high-stakes choices."]
    },
    {
      id: "rules-and-learning",
      title: "Rules versus machine learning",
      minutes: 9,
      body: [
        "A rules-based program uses instructions written by people. For example, a school website might show a late warning when a date is before today. The rule is visible and predictable, but a human must anticipate the cases.",
        "Machine learning lets a program adjust internal numbers after seeing examples. A team can show a model many messages labeled spam or not-spam, then test whether it recognizes patterns in new messages. The model's output is a prediction rather than a personal opinion.",
        "Learning from examples is powerful when the examples resemble the future. It can fail when the data is too small, contains mistakes, or represents only one group of people. More data is not automatically better data. The quality and coverage of a dataset matter.",
        "Many real products combine both approaches. A model may suggest a result while rules enforce safety limits. Understanding this mix helps you ask where a decision came from and who can correct it.",
        "A classifier is a model that sorts inputs into categories. A spam filter may learn clues from messages labeled spam or not-spam, while a map route planner may estimate travel time from road and traffic data. The labels and examples shape what the classifier notices.",
        "A model should be tested on new examples that were not used for training. If it only performs well on familiar examples, it may be overfitting instead of learning a useful pattern. People then revise the dataset, labels, rules, or goal."
      ],
      keyTakeaways: ["Rules are written directly, while models learn patterns from examples.", "Training examples and labels shape what a model recognizes.", "Reliable systems often combine learned predictions with human-written rules."]
    },
    {
      id: "language-models",
      title: "How language models predict text",
      minutes: 9,
      body: [
        "A large language model, or LLM, reads text as small pieces called tokens. A token might be a whole short word, part of a longer word, or punctuation. The model uses the earlier tokens as context and calculates likely next tokens.",
        "For example, after “The dog chased the,” words such as “ball” may be more likely than “calendar.” The model repeats this next-token process many times to create a response. It is generating a likely continuation, not retrieving a guaranteed answer. A familiar pattern can still be wrong.",
        "During training, the model adjusts many numerical settings so its predictions match patterns in a large collection of text. Later, additional training and human feedback can make responses more helpful or safer. These steps shape how the model responds to later prompts.",
        "A prompt gives the model a starting task and context, such as asking for a biology explanation at a ninth-grade reading level. More useful context can guide the response, but it does not guarantee accuracy. The model still needs a clear limit and a human reader.",
        "Fluent language can hide uncertainty. The model may connect familiar patterns into a sentence that sounds reasonable but is unsupported, a problem often called a hallucination. Treat an LLM as a drafting partner whose work needs checking."
      ],
      keyTakeaways: ["LLMs generate text one token at a time.", "A likely continuation is not the same as a verified fact.", "Clear prompts, useful context, and careful checking improve responsible use."]
    },
    {
      id: "data-and-bias",
      title: "Training data and bias",
      minutes: 9,
      body: [
        "Training data is the collection of examples used to shape a model. It can include writing, images, measurements, or labeled decisions. The sources, labels, and gaps in that collection affect what the model learns.",
        "Bias is a repeated pattern that treats people or ideas unfairly. A model can repeat bias found in its data even when no programmer intended that result. For example, a hiring model trained on a narrow past workforce may favor the same narrow path. This can affect people who were underrepresented in the examples.",
        "Fairness is not solved by one magic test. Teams should check performance across groups, involve people affected by the system, document limitations, and provide ways to appeal a harmful decision. Different goals may require different fairness checks.",
        "Labels can also carry bias. If a dataset labels some writing as less trustworthy because of language style, a model may learn a proxy variable for identity instead of measuring the intended quality. Careful label design and review can reduce that risk.",
        "When you use an AI tool, ask whose voices are represented, what may be missing, and who bears the risk of an error. These questions turn vague concern into practical evaluation. They help you move from concern to action."
      ],
      keyTakeaways: ["Data choices and labels influence model behavior.", "Bias can be inherited from past patterns and can affect fairness.", "Fair systems need testing, participation, documentation, and appeals."]
    },
    {
      id: "strengths-and-limits",
      title: "Strengths, limits, and hallucinations",
      minutes: 8,
      body: [
        "AI tools are useful for spotting patterns, offering many draft ideas, translating between formats, and handling repetitive work. They can help a student compare explanations or make a first practice quiz. These strengths are most useful when the task is low risk.",
        "A hallucination is a made-up answer presented as if it were true. Language models can invent sources, names, dates, or quotations because their main goal is producing plausible text, not proving each sentence. The error may be hard to notice because the wording sounds polished.",
        "Verification should match the stakes. Check a fun brainstorm lightly, but check a science claim against a trusted source and ask a teacher before relying on advice about health, safety, or money. The more serious the consequence, the stronger the check should be.",
        "Accuracy means being correct on the task being measured, but accuracy is not the same as truth in every situation. A system can be accurate on common examples and still miss unusual cases. Check the examples and the consequences of an error. A single score cannot tell the whole story.",
        "The strongest workflow gives AI a limited role: define the goal, ask for a draft, inspect the result, correct it, and take responsibility for what you submit. You are the decision-maker. This habit keeps the tool in a supporting role."
      ],
      keyTakeaways: ["AI is often useful for patterns, drafts, and repetitive tasks.", "Hallucinations are plausible-sounding inventions that require verification.", "The user is responsible for checking and using an output."]
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
      { text: "Limited offer: buy followers with guaranteed results.", label: "spam" },
      { text: "Your science club meeting is today at 3:15 in Room 204!", label: "not-spam" },
      { text: "Please review the attached schedule before tomorrow's rehearsal.", label: "not-spam" },
      { text: "A quiet reminder: confirm your reward by replying with your bank details.", label: "spam" },
      { text: "You are invited to the library study group; bring your history notes.", label: "not-spam" },
      { text: "Your package is waiting. Pay a small release fee through this unfamiliar link.", label: "spam" },
      { text: "Final notice: your account qualifies for a private bonus if you act today.", label: "spam" }
    ]
  },
  quiz: [
    { id: "f1", prompt: "Which description best fits AI?", choices: ["A digital person with feelings", "A family of systems that find patterns or perform tasks", "Any program with a screen", "A perfect source of facts"], answerIndex: 1, explanation: "AI describes many task-focused systems; it does not imply feelings or perfect knowledge." },
    { id: "f2", prompt: "What does a machine-learning model learn from?", choices: ["Only handwritten rules", "Examples and patterns in data", "A human's memories", "A permanent list of answers"], answerIndex: 1, explanation: "Machine learning adjusts itself using examples, though people still choose data and goals." },
    { id: "f3", prompt: "What does an LLM usually predict next?", choices: ["A verified fact", "A likely token given the context", "The user's feelings", "The future"], answerIndex: 1, explanation: "An LLM generates likely next tokens. That process can produce fluent but incorrect claims." },
    { id: "f4", prompt: "Why can training data create bias?", choices: ["Data has no effect", "The data may repeat gaps or unfair past patterns", "Models dislike numbers", "Bias only comes from keyboards"], answerIndex: 1, explanation: "A model can reproduce patterns in its sources, labels, or missing representation." },
    { id: "f5", prompt: "What is a good response to a possible hallucination?", choices: ["Share it immediately", "Verify it with trusted sources", "Assume confidence means truth", "Delete every AI tool"], answerIndex: 1, explanation: "Verification should match the stakes; important claims need trusted evidence." },
    { id: "f6", prompt: "What does a classifier do?", choices: ["Sorts inputs into categories", "Writes only poetry", "Stores every password", "Guarantees fairness"], answerIndex: 0, explanation: "A classifier assigns inputs to categories such as spam or not-spam." },
    { id: "f7", prompt: "Why can a model that memorizes training examples fail?", choices: ["It may be overfitting", "It has learned human feelings", "It is always more accurate", "It no longer uses data"], answerIndex: 0, explanation: "Overfitting means a model fits familiar examples too closely and performs poorly on new ones." },
    { id: "f8", prompt: "What is a token in an LLM?", choices: ["A small piece of text used during prediction", "A verified citation", "A human review board", "A camera sensor"], answerIndex: 0, explanation: "LLMs process text as tokens, such as words, word parts, or punctuation." }
  ]
};
