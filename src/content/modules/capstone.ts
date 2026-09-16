import type { Module } from "../types";

export const capstone: Module = {
  id: "capstone",
  slug: "capstone",
  title: "AI Compass Capstone",
  tagline: "Plan a useful school project with AI in the right role.",
  color: "amber",
  icon: "🚀",
  lessons: [
    { id: "project-brief", title: "Start with a human goal", minutes: 9, body: [
      "A strong project begins with a problem that matters to a real audience. Describe what you want to improve, who benefits, and how you will know whether your idea helped. A clear goal keeps the project from becoming a tool demonstration.",
      "Choose one small role for AI, such as organizing ideas, generating practice questions, or comparing formats. A narrow role is easier to check than an instruction to do everything. It also makes responsibility easier to assign.",
      "Write down what must remain yours: decisions, interviews, calculations, creative direction, or final explanation. This boundary protects learning and authorship. It tells teammates where human judgment is required.",
      "For example, a student team might build a study guide for a biology unit on ecosystems. Their audience is classmates, their goal is to help students practice key terms, and AI's role is to suggest question formats from notes the team wrote themselves. The team chooses this role because it is easy to review.",
      "The team still chooses accurate definitions, writes the explanations, and asks the biology teacher to check difficult ideas. A plan can change after testing. They keep a record of prompts, outputs, sources, checks, and revisions so a reader can follow their reasoning. Their process shows where human oversight mattered."
    ], keyTakeaways: ["Begin with a real audience and a measurable goal.", "Give AI a narrow, useful role that the team can verify.", "Define which thinking, evidence, and decisions remain yours."] },
    { id: "responsible-launch", title: "Test, credit, and share", minutes: 9, body: [
      "Before sharing a result, test it with examples that represent the people and situations it will serve. Look for errors, unfair assumptions, privacy risks, and confusing instructions. Testing is part of the project, not an optional extra.",
      "Use sources for important facts and explain how AI contributed. A reader should be able to tell which parts are evidence, which are your choices, and which were assisted. Clear credit makes the process easier to trust.",
      "Invite feedback from someone affected by the project. Their experience may reveal a problem that a technical test misses. Listen without treating feedback as a personal attack.",
      "The biology team tests its study guide with classmates who have different levels of preparation. They compare each answer with the textbook and ask the teacher to review any question that could have more than one reasonable answer. They remove private student information from the prompts and examples.",
      "The team credits the chatbot in a process note and labels which questions were assisted. They also set a stop rule: if the guide contains repeated hallucinations, confusing advice, or content they cannot verify, they pause, revise, or choose a hand-written method instead. Stopping is a responsible decision, not a failure."
    ], keyTakeaways: ["Test a project with varied examples and people before sharing it.", "Credit AI assistance and cite the evidence behind important claims.", "Feedback and a clear stop rule make a project safer to launch."] }
  ],
  activity: {
    kind: "capstone", id: "project-plan", title: "Build your ethical project plan", intro: "Draft a clear plan you could explain to a teacher, teammate, and person affected by the project.",
    steps: [
      { id: "goal", prompt: "What problem will your school project address, and who is the audience?", placeholder: "Our project will help..." },
      { id: "role", prompt: "What small role will AI play? What will you do without it?", placeholder: "AI will help with..., while I will..." },
      { id: "evidence", prompt: "How will you verify facts and test the result?", placeholder: "We will check..." },
      { id: "ethics", prompt: "What privacy, fairness, academic integrity, or environmental risk will you manage?", placeholder: "A risk is..., so we will..." },
      { id: "share", prompt: "How will you credit assistance and invite feedback?", placeholder: "We will disclose..., and ask..." }
    ]
  },
  quiz: [
    { id: "c1", prompt: "What should a capstone plan name first?", choices: ["A flashy tool", "A human goal and audience", "A secret prompt", "A final grade"], answerIndex: 1, explanation: "The goal and audience keep the tool connected to a meaningful need." },
    { id: "c2", prompt: "Why give AI a narrow role?", choices: ["It is easier to check", "It removes all responsibility", "It guarantees truth", "It hides the process"], answerIndex: 0, explanation: "A limited role makes verification and accountability clearer." },
    { id: "c3", prompt: "What belongs in a project record?", choices: ["Only the final screenshot", "Prompts, outputs, checks, and revisions", "Private passwords", "Nothing about AI"], answerIndex: 1, explanation: "A process record makes reasoning and assistance transparent." },
    { id: "c4", prompt: "Who can reveal a problem technical tests miss?", choices: ["Only the tool", "People affected by the project", "Nobody", "A random headline"], answerIndex: 1, explanation: "Affected people bring context and lived experience to evaluation." },
    { id: "c5", prompt: "When should a team pause a project?", choices: ["When a risk cannot be verified or causes harm", "Whenever a draft needs edits", "Only after publishing", "Never"], answerIndex: 0, explanation: "A stop rule helps a team respond before preventable harm grows." },
    { id: "c6", prompt: "What is an appropriate AI role in the biology study-guide project?", choices: ["Replace all textbook checking", "Suggest practice-question formats from the team's notes", "Choose the team's final grade", "Collect classmates' private records"], answerIndex: 1, explanation: "A narrow role such as suggesting formats is useful while the team verifies content and protects privacy." },
    { id: "c7", prompt: "What should the biology team do with an answer it cannot verify?", choices: ["Publish it because it sounds confident", "Pause and revise or remove it", "Hide the source of the answer", "Ask the chatbot to repeat it"], answerIndex: 1, explanation: "Unverified content should not be shared as study material; the team should check, revise, or remove it." },
    { id: "c8", prompt: "Why test the study guide with classmates?", choices: ["To find confusing questions and missing perspectives", "To avoid using sources", "To prove every answer is perfect", "To collect private passwords"], answerIndex: 0, explanation: "Feedback from varied classmates can reveal problems that the project team or a technical check misses." }
  ]
};
