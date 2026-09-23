import type { Module } from "../types";

export const realWorld: Module = {
  id: "real-world",
  slug: "ai-in-the-real-world",
  title: "AI in the Real World",
  tagline: "See how people use AI, and where human expertise still leads.",
  color: "emerald",
  icon: "🌍",
  lessons: [
    { id: "careers", title: "Changing careers and skills", minutes: 7, body: [
      "AI changes tasks inside jobs more often than it replaces every part of a job. A designer may use a tool for rough variations while spending more time on goals, taste, communication, and decisions.",
      "Future-ready skills include asking good questions, checking evidence, explaining choices, working with people, and learning new tools. These skills matter even when a particular tool changes.",
      "Every career has context that a general tool may miss. Nurses, electricians, writers, and scientists bring experience, responsibility, and relationships that cannot be reduced to a prompt.",
      "Explore careers by asking what problems they solve and what judgment they require. AI literacy is one useful layer, not a replacement for a subject you care about."
    ], keyTakeaways: ["AI often changes tasks within jobs.", "Human judgment and communication remain valuable.", "Learning how to learn is a durable skill."] },
    { id: "medicine", title: "Medicine and human care", minutes: 8, body: [
      "Medical teams use AI to help read images, predict risks, organize notes, and discover patterns in research. A tool can help a professional notice something, but it does not replace clinical responsibility.",
      "Health data is sensitive. A system must be tested on the people it serves, monitored for errors, and used with privacy protections. A patient should know how decisions are made and have a way to ask questions.",
      "False reassurance and missed warnings can both harm someone. That is why medical AI needs qualified people, clear limits, and careful evidence rather than a polished demo.",
      "The same lesson applies to other high-stakes fields: use AI as support inside an accountable process, not as an invisible authority."
    ], keyTakeaways: ["Medical AI supports professionals but does not replace care.", "Sensitive data and unequal errors need special protection.", "High-stakes tools require accountability and evidence."] },
    { id: "climate", title: "Climate and the environment", minutes: 7, body: [
      "Researchers use machine learning to study weather patterns, map forests, improve energy systems, and predict where floods may occur. These tools can process more measurements than a person could examine alone.",
      "A model's prediction depends on the sensors, historical records, and assumptions behind it. Changing climate conditions can make past patterns less reliable, so scientists compare models with physical knowledge.",
      "AI also has costs, including energy and water use. A useful environmental project measures whether the benefit is large enough and whether a smaller method could work.",
      "Students can practice this thinking by asking what data is missing, whose community is affected, and how a prediction should be checked before action."
    ], keyTakeaways: ["AI can help analyze complex environmental data.", "Models depend on data and assumptions.", "Environmental benefits should be weighed against resource costs."] },
    { id: "creative-fields", title: "Creative work and collaboration", minutes: 7, body: [
      "Writers, musicians, filmmakers, and artists may use AI for brainstorming, drafts, accessibility, or repetitive editing. The creative purpose, selection, and final choices still come from people.",
      "Creators should understand permissions and credit. Training sources, style imitation, and ownership rules are changing, so a professional checks the expectations for a project instead of assuming every generated result is free to use.",
      "A useful collaboration preserves a human point of view. Start with your own idea, use a tool for a narrow part, and revise until the result expresses a choice you can explain.",
      "Labeling generated elements builds trust with audiences and collaborators. Creativity includes responsibility for how a work was made."
    ], keyTakeaways: ["AI can assist creative tasks without owning the creative purpose.", "Permissions and credit matter.", "A human point of view and transparent process build trust."] },
    { id: "keep-learning", title: "Keep learning on purpose", minutes: 6, body: [
      "No tool stays still. A good learner follows reliable updates, experiments with low-risk tasks, and compares claims rather than chasing every trend.",
      "Build a small portfolio of work that shows your process: a prompt, a draft, your checks, and your reflection. This makes learning visible and helps you notice improvement.",
      "When a tool fails, ask whether the issue was the data, the prompt, the task, or the tool itself. Failure is useful evidence when you record what happened.",
      "Your compass is a cycle: learn the basics, try a small task, verify the result, reflect on impact, and choose the next skill."
    ], keyTakeaways: ["Tools change, so learning habits matter.", "Documenting your process shows growth.", "Try, verify, reflect, and choose the next step."] }
  ],
  activity: {
    kind: "case-studies", id: "real-world-cases", title: "Case-study field notes", intro: "Open each case, then write at least one sentence about a benefit, risk, or question.",
    cases: [
      { id: "c1", title: "A hospital image assistant", summary: "A model flags possible signs in scans so a radiologist can review them. The team tests it on varied patients and keeps a clinician in charge.", reflection: "What evidence and human checks would you want before trusting this support?" },
      { id: "c2", title: "A neighborhood heat map", summary: "Students combine tree cover and temperature data to identify blocks that may need shade. They meet residents before recommending changes.", reflection: "Whose knowledge belongs alongside the model's measurements?" },
      { id: "c3", title: "An apprentice developer", summary: "A learner asks an assistant to explain an error, then writes a test and checks the suggested fix rather than copying it blindly.", reflection: "How does this workflow preserve learning?" },
      { id: "c4", title: "A songwriter's sketchbook", summary: "A musician uses a tool to list unusual rhyme ideas, then writes an original chorus and labels the brainstorming assistance.", reflection: "What makes this collaboration honest and creative?" },
      { id: "c5", title: "A changing workplace", summary: "A local shop automates inventory counting but trains staff for customer support and reviews mistakes each week.", reflection: "What responsibilities should an organization have when tasks change?" }
    ]
  },
  quiz: [
    { id: "r1", prompt: "What skill remains useful as tools change?", choices: ["Never checking work", "Explaining choices and learning new methods", "Memorizing one interface", "Avoiding people"], answerIndex: 1, explanation: "Reasoning, communication, and learning habits transfer across tools." },
    { id: "r2", prompt: "Why does medical AI need human oversight?", choices: ["It never uses data", "Errors can affect health and responsibility", "Doctors cannot read", "Oversight slows every task"], answerIndex: 1, explanation: "High-stakes decisions need qualified accountability and review." },
    { id: "r3", prompt: "What should an environmental model user ask?", choices: ["What data and assumptions shape it?", "Is it the biggest model?", "Can we skip residents?", "Does speed prove truth?"], answerIndex: 0, explanation: "Data, assumptions, missing voices, and impact shape responsible use." },
    { id: "r4", prompt: "What builds trust in AI-assisted creative work?", choices: ["Hiding all assistance", "Understanding permissions and labeling use", "Copying a living artist exactly", "Removing human choices"], answerIndex: 1, explanation: "Credit, permission, transparency, and human purpose matter." },
    { id: "r5", prompt: "Which cycle supports lifelong AI learning?", choices: ["Try, verify, reflect, and choose", "Copy, publish, forget", "Trust, repeat, hide", "Wait for tools to stop changing"], answerIndex: 0, explanation: "An intentional cycle turns experiments into durable learning." }
  ]
};
