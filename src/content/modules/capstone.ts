import type { Module } from "../types";

export const capstone: Module = {
  id: "capstone",
  slug: "capstone",
  title: "Wordplay Capstone",
  tagline: "Plan a useful school project with AI in the right role.",
  color: "amber",
  icon: "🚀",
  lessons: [
    { id: "project-brief", title: "Start with a human goal", minutes: 7, body: [
      "A strong project begins with a problem that matters to a real audience. Describe what you want to improve, who benefits, and how you will know whether your idea helped.",
      "Choose one small role for AI, such as organizing ideas, generating practice questions, or comparing formats. A narrow role is easier to check than an instruction to do everything.",
      "Write down what must remain yours: decisions, interviews, calculations, creative direction, or final explanation. This boundary protects learning and authorship.",
      "A plan can change after testing. Keep a record of the prompt, output, checks, and revisions so a reader can follow your reasoning."
    ], keyTakeaways: ["Begin with a real audience and measurable goal.", "Give AI a narrow, useful role.", "Define which thinking and decisions remain yours."] },
    { id: "responsible-launch", title: "Test, credit, and share", minutes: 7, body: [
      "Before sharing a result, test it with examples that represent the people and situations it will serve. Look for errors, unfair assumptions, privacy risks, and confusing instructions.",
      "Use sources for important facts and explain how AI contributed. A reader should be able to tell which parts are evidence, which are your choices, and which were assisted.",
      "Invite feedback from someone affected by the project. Their experience may reveal a problem that a technical test misses.",
      "A responsible launch includes a stop rule: if the project causes unexpected harm or cannot be verified, pause, revise, or choose a non-AI approach."
    ], keyTakeaways: ["Test with representative examples.", "Credit assistance and cite evidence.", "Feedback and stop rules make projects safer."] }
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
    { id: "c5", prompt: "When should a team pause a project?", choices: ["When a risk cannot be verified or causes harm", "Whenever a draft needs edits", "Only after publishing", "Never"], answerIndex: 0, explanation: "A stop rule helps a team respond before preventable harm grows." }
  ]
};
