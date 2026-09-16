import type { Module } from "../types";

export const realWorld: Module = {
  id: "real-world",
  slug: "ai-in-the-real-world",
  title: "AI in the Real World",
  tagline: "See how people use AI, and where human expertise still leads.",
  color: "emerald",
  icon: "🌍",
  lessons: [
    { id: "careers", title: "Changing careers and skills", minutes: 8, body: [
      "AI changes tasks inside jobs more often than it replaces every part of a job. A designer may use a tool for rough variations while spending more time on goals, taste, communication, and decisions. The job still requires a person to understand the audience.",
      "Future-ready skills include asking good questions, checking evidence, explaining choices, working with people, and learning new tools. These skills matter even when a particular tool changes. They help people adapt rather than depend on one interface.",
      "Every career has context that a general tool may miss. Nurses, electricians, writers, and scientists bring experience, responsibility, and relationships that cannot be reduced to a prompt. Their decisions affect real people and places.",
      "Some jobs use AI to sort information, draft routine text, or predict maintenance needs. People still set goals, notice unusual situations, and decide how to respond. A worker who understands the limits of a model can catch mistakes earlier.",
      "Explore careers by asking what problems they solve and what judgment they require. AI literacy is one useful layer, not a replacement for a subject you care about. Curiosity about people and problems is a strong starting point."
    ], keyTakeaways: ["AI often changes tasks within jobs.", "Human judgment and communication remain valuable.", "Learning how to learn is a durable skill."] },
    { id: "medicine", title: "Medicine and human care", minutes: 9, body: [
      "Medical teams use AI to help read images, predict risks, organize notes, and discover patterns in research. A tool can help a professional notice something, but it does not replace clinical responsibility. The care team remains accountable for the patient.",
      "Health data is sensitive. A system must be tested on the people it serves, monitored for errors, and used with privacy protections. A patient should know how decisions are made and have a way to ask questions. Trust depends on this transparency.",
      "False reassurance and missed warnings can both harm someone. That is why medical AI needs qualified people, clear limits, and careful evidence rather than a polished demo. A useful test includes the difficult cases, not just easy examples.",
      "For example, a medical-image reading assistant might flag a possible pattern for a radiologist to review. The clinician compares the image with the patient's history and other evidence. The assistant supports attention, while the care team remains responsible for the decision.",
      "The same lesson applies to other high-stakes fields: use AI as support inside an accountable process, not as an invisible authority. People should know who is responsible for the final decision. Support should never become a hidden replacement for care."
    ], keyTakeaways: ["Medical AI supports professionals but does not replace care.", "Sensitive data and unequal errors need special protection.", "High-stakes tools require accountability and evidence."] },
    { id: "climate", title: "Climate and the environment", minutes: 8, body: [
      "Researchers use machine learning to study weather patterns, map forests, improve energy systems, and predict where floods may occur. These tools can process more measurements than a person could examine alone. Scientists still decide what the measurements mean.",
      "A model's prediction depends on the sensors, historical records, and assumptions behind it. Changing climate conditions can make past patterns less reliable, so scientists compare models with physical knowledge. They also communicate uncertainty instead of hiding it.",
      "AI also has costs, including energy and water use. A useful environmental project measures whether the benefit is large enough and whether a smaller method could work. Resource use belongs in the project plan.",
      "A flood-prediction model might combine rainfall, river levels, soil conditions, and maps. Emergency teams still compare its warning with local observations and decide how to communicate uncertainty. A prediction is useful when it improves preparation, not when it pretends to be certain.",
      "Students can practice this thinking by asking what data is missing, whose community is affected, and how a prediction should be checked before action. A good question can improve both the model and the decision. It can also reveal when a different method is better."
    ], keyTakeaways: ["AI can help analyze complex environmental data.", "Models depend on data and assumptions.", "Environmental benefits should be weighed against resource costs."] },
    { id: "creative-fields", title: "Creative work and collaboration", minutes: 8, body: [
      "Writers, musicians, filmmakers, and artists may use AI for brainstorming, drafts, accessibility, or repetitive editing. The creative purpose, selection, and final choices still come from people. Those choices give a work its point of view.",
      "Creators should understand permissions and credit. Training sources, style imitation, and ownership rules are changing, so a professional checks the expectations for a project instead of assuming every generated result is free to use. A tool's convenience does not settle a rights question.",
      "A useful collaboration preserves a human point of view. Start with your own idea, use a tool for a narrow part, and revise until the result expresses a choice you can explain. Revision is where many creative decisions become visible.",
      "An image generator might help a club explore poster layouts, while students choose the message, check accessibility, and create or license the final images. A music tool might suggest chord patterns, but a musician still decides what fits the story. The human team should be able to describe its choices.",
      "Labeling generated elements builds trust with audiences and collaborators. Creativity includes responsibility for how a work was made. Honest process information helps others evaluate the work."
    ], keyTakeaways: ["AI can assist creative tasks without owning the creative purpose.", "Permissions and credit matter.", "A human point of view and transparent process build trust."] },
    { id: "keep-learning", title: "Keep learning on purpose", minutes: 8, body: [
      "No tool stays still. A good learner follows reliable updates, experiments with low-risk tasks, and compares claims rather than chasing every trend. Reliable sources are more useful than hype.",
      "Build a small portfolio of work that shows your process: a prompt, a draft, your checks, and your reflection. This makes learning visible and helps you notice improvement. It also gives others a way to understand your choices.",
      "When a tool fails, ask whether the issue was the data, the prompt, the task, or the tool itself. Failure is useful evidence when you record what happened. A small experiment can distinguish among these causes.",
      "Talk with people who use tools in real settings, including teachers, librarians, engineers, artists, and community workers. Their practical context can reveal needs that a demo hides. It can also help you choose a problem worth solving.",
      "Your compass is a cycle: learn the basics, try a small task, verify the result, reflect on impact, and choose the next skill. Repeating this cycle makes improvement intentional. Each cycle builds confidence without requiring blind trust."
    ], keyTakeaways: ["Tools change, so learning habits matter.", "Documenting your process shows growth.", "Try, verify, reflect, and choose the next step."] }
  ],
  activity: {
    kind: "case-studies", id: "real-world-cases", title: "Case-study field notes", intro: "Open each case, then write at least one sentence about a benefit, risk, or question.",
    cases: [
      { id: "c1", title: "A hospital image assistant", summary: "A model flags possible signs in scans so a radiologist can review them. The team tests it on varied patients and keeps a clinician in charge.", reflection: "What evidence and human checks would you want before trusting this support?" },
      { id: "c2", title: "A neighborhood heat map", summary: "Students combine tree cover and temperature data to identify blocks that may need shade. They meet residents before recommending changes.", reflection: "Whose knowledge belongs alongside the model's measurements?" },
      { id: "c3", title: "An apprentice developer", summary: "A learner asks an assistant to explain an error, then writes a test and checks the suggested fix rather than copying it blindly.", reflection: "How does this workflow preserve learning?" },
      { id: "c4", title: "A songwriter's sketchbook", summary: "A musician uses a tool to list unusual rhyme ideas, then writes an original chorus and labels the brainstorming assistance.", reflection: "What makes this collaboration honest and creative?" },
      { id: "c5", title: "A changing workplace", summary: "A local shop automates inventory counting but trains staff for customer support and reviews mistakes each week.", reflection: "What responsibilities should an organization have when tasks change?" },
      { id: "c6", title: "A school office translation helper", summary: "A school office uses a translation app to draft a message for a family. Staff ask a fluent speaker to review the final version before sending it and keep the original text beside the translation.", reflection: "Why should a person review an important translated message?" },
      { id: "c7", title: "A farm checks crop stress", summary: "A farm combines drone images with machine learning to flag areas where plants may need attention. A grower visits the field, checks soil and weather conditions, and decides whether any action is needed.", reflection: "How do the model and the grower's local knowledge work together?" }
    ]
  },
  quiz: [
    { id: "r1", prompt: "What skill remains useful as tools change?", choices: ["Never checking work", "Explaining choices and learning new methods", "Memorizing one interface", "Avoiding people"], answerIndex: 1, explanation: "Reasoning, communication, and learning habits transfer across tools." },
    { id: "r2", prompt: "Why does medical AI need human oversight?", choices: ["It never uses data", "Errors can affect health and responsibility", "Doctors cannot read", "Oversight slows every task"], answerIndex: 1, explanation: "High-stakes decisions need qualified accountability and review." },
    { id: "r3", prompt: "What should an environmental model user ask?", choices: ["What data and assumptions shape it?", "Is it the biggest model?", "Can we skip residents?", "Does speed prove truth?"], answerIndex: 0, explanation: "Data, assumptions, missing voices, and impact shape responsible use." },
    { id: "r4", prompt: "What builds trust in AI-assisted creative work?", choices: ["Hiding all assistance", "Understanding permissions and labeling use", "Copying a living artist exactly", "Removing human choices"], answerIndex: 1, explanation: "Credit, permission, transparency, and human purpose matter." },
    { id: "r5", prompt: "Which cycle supports lifelong AI learning?", choices: ["Try, verify, reflect, and choose", "Copy, publish, forget", "Trust, repeat, hide", "Wait for tools to stop changing"], answerIndex: 0, explanation: "An intentional cycle turns experiments into durable learning." },
    { id: "r6", prompt: "What is a responsible use of a medical-image assistant?", choices: ["Let it make every diagnosis alone", "Have a qualified clinician review its suggestion", "Ignore the patient's history", "Publish every scan online"], answerIndex: 1, explanation: "A clinician must combine the tool's suggestion with patient information and accountable judgment." },
    { id: "r7", prompt: "What might a flood-prediction model use?", choices: ["Rainfall and river measurements", "Only a random guess", "A student's password", "A music playlist"], answerIndex: 0, explanation: "Environmental models can combine measurements such as rainfall, river levels, soil, and maps." },
    { id: "r8", prompt: "Why should a school office review an AI translation?", choices: ["Translation apps never produce drafts", "A person can catch meaning or tone errors", "Review makes privacy impossible", "The original text is unimportant"], answerIndex: 1, explanation: "Human review helps preserve important meaning, tone, and context in a message." }
  ]
};
