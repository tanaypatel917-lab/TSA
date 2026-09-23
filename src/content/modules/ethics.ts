import type { Module } from "../types";

const l = (id: string, title: string, body: string[]) => ({
  id, title, minutes: 8, body, keyTakeaways: body.slice(0, 3).map((p) => p.split(".")[0] + ".")
});

export const ethics: Module = {
  id: "ethics",
  slug: "ethical-ai",
  title: "Ethical & Responsible Use",
  tagline: "Make choices that respect people, truth, privacy, and the planet.",
  color: "rose",
  icon: "🫶",
  lessons: [
    l("academic-integrity", "Learning honestly with AI", [
      "Academic integrity means your work represents your own learning and follows the assignment rules. AI can be allowed for brainstorming in one class and prohibited for a final paragraph in another.",
      "Disclose assistance when required. A short note can say which tool you used, what it helped with, and what you changed or verified. Do not claim a generated idea as your own if the rules say to credit it.",
      "The goal is not to ban every tool. The goal is to keep practice, assessment, and credit honest. If a tool does the thinking that an assignment is measuring, it has replaced the learning.",
      "When instructions are unclear, ask before submitting. A teacher would rather answer a question early than discover a hidden use later."
    ]),
    l("fairness", "Bias and fairness", [
      "An AI system can treat groups differently because its data, labels, or design reflect unequal history. A high accuracy number can hide poor results for a smaller group.",
      "Fairness questions start with people: who uses the system, who is affected, and who gets to challenge a decision? Technical tests help, but they do not replace listening to communities.",
      "A fair process uses representative testing, clear explanations, human review, and a way to appeal. It also records known limits instead of pretending a model is neutral.",
      "As a student, look for missing perspectives in an AI summary or image. Ask what evidence supports a claim and whether the tool's output could stereotype someone."
    ]),
    l("privacy", "Privacy and personal data", [
      "Personal data includes names, locations, contact details, health information, school records, faces, and messages. A prompt can reveal more than you intended when several small details are combined.",
      "Before using a tool, check what it stores and whether the setting allows your prompt to improve the service. School-managed tools may have different protections from public websites.",
      "Use fictional details or remove identifying information when practicing. Never paste another person's private information without permission and a valid reason.",
      "Privacy is about control and context, not just secrecy. A detail shared with a friend may still be inappropriate to upload to a large service."
    ]),
    l("misinformation", "Misinformation and deepfakes", [
      "Misinformation is false or misleading content, whether shared by mistake or on purpose. Generative tools make it easier to create convincing text, audio, and images at high speed.",
      "Deepfakes can put words or actions into a person's mouth. A familiar face or confident headline is not proof. Check the original source, date, supporting evidence, and independent reporting.",
      "Pause before sharing content that triggers anger or excitement. Reverse-image tools, transcripts, and source comparisons can reveal missing context, but no single detector is perfect.",
      "Responsible creators label synthetic media and avoid making fake content that could harm a person, community, or emergency response."
    ]),
    l("impact", "Environmental and labor impact", [
      "Training and running large models use electricity and water for data centers. The impact depends on the model, hardware, energy source, and how often it is used.",
      "Many AI systems also rely on people who label data, moderate harmful content, or review outputs. Their work deserves fair pay, safe conditions, and respect.",
      "A responsible choice considers whether AI adds enough value to justify its costs. Smaller tools, shorter prompts, reuse, and human methods can sometimes meet the goal with less impact.",
      "Thinking about impact does not require perfect choices. It means asking who benefits, who pays, and how a system can be improved."
    ])
  ],
  activity: {
    kind: "scenarios", id: "ethics-scenarios", title: "Make the responsible call", intro: "Choose the response you would defend to the people affected. Read the feedback after each choice.",
    scenarios: [
      { id: "s1", situation: "Your history teacher allows AI brainstorming but asks for disclosure. You use it to make an outline.", options: [
        { text: "Submit the outline silently.", ok: false, feedback: "The use is hidden even though the class rule asks for disclosure." },
        { text: "Add a note explaining the tool's role and write the final work yourself.", ok: true, feedback: "This follows the rule and keeps authorship clear." },
        { text: "Ask the tool to write the whole essay.", ok: false, feedback: "That replaces the learning the assignment is meant to measure." }
      ]},
      { id: "s2", situation: "A model gives lower recommendation scores to applications from one neighborhood.", options: [
        { text: "Ship it because the overall accuracy is high.", ok: false, feedback: "An average can hide unequal harm." },
        { text: "Check group outcomes, investigate causes, and create human review.", ok: true, feedback: "Testing impact and offering review are parts of a fair process." },
        { text: "Delete the neighborhood name and assume the problem is gone.", ok: false, feedback: "Other data can act as a proxy, so the impact needs testing." }
      ]},
      { id: "s3", situation: "A club wants feedback on members' essays using a public AI site.", options: [
        { text: "Paste names, email addresses, and drafts.", ok: false, feedback: "That shares identifying information without a clear need." },
        { text: "Remove identifying details and check the tool's policy first.", ok: true, feedback: "Minimizing data and checking the setting reduces privacy risk." },
        { text: "Use a private message from another student as an example.", ok: false, feedback: "Another person's message is not yours to upload." }
      ]},
      { id: "s4", situation: "A dramatic video claims a scientist announced a dangerous discovery.", options: [
        { text: "Share it quickly so friends are warned.", ok: false, feedback: "Fast sharing can spread a false claim further." },
        { text: "Find the original source and compare independent reporting.", ok: true, feedback: "Source and context checks are stronger than a video's appearance." },
        { text: "Trust it because the audio sounds natural.", ok: false, feedback: "Synthetic audio can sound natural." }
      ]},
      { id: "s5", situation: "You need ten practice questions and can use a small local tool or a huge online model.", options: [
        { text: "Use the largest model automatically.", ok: false, feedback: "More compute is not always needed for a simple task." },
        { text: "Choose a tool that meets the goal and avoid sharing private data.", ok: true, feedback: "Fit, privacy, and impact all belong in the decision." },
        { text: "Use any tool, then hide how it was made.", ok: false, feedback: "Honest disclosure and appropriate use matter." }
      ]},
      { id: "s6", situation: "A generated image makes a classmate look foolish and could be mistaken for real.", options: [
        { text: "Post it with no label because it is funny.", ok: false, feedback: "Unlabeled synthetic media can harm someone and mislead viewers." },
        { text: "Do not share it without consent; use a clearly labeled harmless example instead.", ok: true, feedback: "Consent, safety, and labeling protect people." },
        { text: "Send it only to a few people.", ok: false, feedback: "A small audience does not remove the harm or deception." }
      ]}
    ]
  },
  quiz: [
    { id: "e1", prompt: "What should you do when a class rule is unclear?", choices: ["Hide your use", "Ask the teacher before submitting", "Assume all use is allowed", "Copy a friend"], answerIndex: 1, explanation: "Clarifying expectations early protects honest learning." },
    { id: "e2", prompt: "Why can overall accuracy be misleading?", choices: ["It may hide unequal results for a group", "Accuracy has no meaning", "It only measures spelling", "It guarantees fairness"], answerIndex: 0, explanation: "Group-level checks can reveal harm hidden by an average." },
    { id: "e3", prompt: "Which is good privacy practice?", choices: ["Upload private messages", "Minimize identifying data and check policies", "Share passwords", "Use real records for practice"], answerIndex: 1, explanation: "Use the least identifying data necessary and understand how a service handles it." },
    { id: "e4", prompt: "What is a useful deepfake check?", choices: ["Trust a familiar face", "Check original sources and independent evidence", "Share before checking", "Assume detectors are perfect"], answerIndex: 1, explanation: "Source, date, context, and corroboration help evaluate synthetic media." },
    { id: "e5", prompt: "Responsible AI use considers:", choices: ["Only speed", "Who benefits, who is affected, and system costs", "Only how impressive it looks", "Whether nobody asks questions"], answerIndex: 1, explanation: "Ethical choices consider people, resources, and accountability." }
  ]
};
