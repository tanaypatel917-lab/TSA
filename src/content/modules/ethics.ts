import type { Module } from "../types";

export const ethics: Module = {
  id: "ethics",
  slug: "ethical-ai",
  title: "Ethical & Responsible Use",
  tagline: "Make choices that respect people, truth, privacy, and the planet.",
  color: "rose",
  icon: "🫶",
  lessons: [
    {
      id: "academic-integrity",
      title: "Learning honestly with AI",
      minutes: 8,
      body: [
      "Academic integrity means your work represents your own learning and follows the assignment rules. AI can be allowed for brainstorming in one class and prohibited for a final paragraph in another. The teacher's instructions set the boundary.",
      "Disclose assistance when required. A short note can say which tool you used, what it helped with, and what you changed or verified. Do not claim a generated idea as your own if the rules say to credit it.",
      "The goal is not to ban every tool. The goal is to keep practice, assessment, and credit honest. If a tool does the thinking that an assignment is measuring, it has replaced the learning.",
      "Keep your own notes, drafts, and sources as you work. A writing assistant can suggest an outline, but you should decide what evidence matters and write in a voice you understand. This record makes your process easier to explain.",
      "When instructions are unclear, ask before submitting. A teacher would rather answer a question early than discover a hidden use later. Asking is part of responsible planning."
      ],
      keyTakeaways: ["Academic integrity means following the assignment rule and representing your own learning.", "Disclose AI assistance when a teacher or school requires it.", "Keep a process record so your decisions and understanding remain visible."]
    },
    {
      id: "fairness",
      title: "Bias and fairness",
      minutes: 9,
      body: [
      "An AI system can treat groups differently because its data, labels, or design reflect unequal history. A high accuracy number can hide poor results for a smaller group. The harm may appear only when results are separated by group.",
      "Fairness questions start with people: who uses the system, who is affected, and who gets to challenge a decision? Technical tests help, but they do not replace listening to communities. People can describe harms that a benchmark misses.",
      "A fair process uses representative testing, clear explanations, human review, and a way to appeal. It also records known limits instead of pretending a model is neutral. These steps create accountability.",
      "A proxy variable can stand in for a sensitive trait even when that trait is removed. Neighborhood, language, or school history might become clues that lead to unequal treatment. Removing one column does not prove that a system is fair.",
      "As a student, look for missing perspectives in an AI summary or image. Ask what evidence supports a claim and whether the tool's output could stereotype someone. You can request a correction when an output is unfair or incomplete.",
      ],
      keyTakeaways: ["Bias can enter through data, labels, design, and proxy variables.", "Fairness requires testing groups, listening to affected people, and offering review.", "A high overall accuracy does not prove that a system treats everyone fairly."]
    },
    {
      id: "privacy",
      title: "Privacy and personal data",
      minutes: 8,
      body: [
      "Personal data includes names, locations, contact details, health information, school records, faces, and messages. A prompt can reveal more than you intended when several small details are combined. Even an unusual hobby can help identify someone.",
      "Before using a tool, check what it stores and whether the setting allows your prompt to improve the service. School-managed tools may have different protections from public websites. Do not assume that a familiar interface is private.",
      "Use fictional details or remove identifying information when practicing. Never paste another person's private information without permission and a valid reason. This protects classmates, families, and teammates.",
      "Privacy is about control and context, not just secrecy. A detail shared with a friend may still be inappropriate to upload to a large service. Data can also be copied or combined after you lose track of it. Think about who could be affected later.",
      "Ask whether the tool truly needs each detail. Minimizing data protects you and other people while still allowing useful practice. Less data can also make a mistake less harmful."
      ],
      keyTakeaways: ["Personal data can identify or affect people when separate details are combined.", "Use the least identifying information necessary and check a tool's data practices.", "Never upload another person's private information without permission and a valid reason."]
    },
    {
      id: "misinformation",
      title: "Misinformation and deepfakes",
      minutes: 9,
      body: [
      "Misinformation is false or misleading content, whether shared by mistake or on purpose. Generative tools make it easier to create convincing text, audio, and images at high speed. Speed can make a mistake spread before anyone checks it.",
      "Deepfakes can put words or actions into a person's mouth. A familiar face or confident headline is not proof. Check the original source, date, supporting evidence, and independent reporting. Look for the full context rather than a short clip.",
      "Pause before sharing content that triggers anger or excitement. Reverse-image tools, transcripts, and source comparisons can reveal missing context, but no single detector is perfect. Human judgment still matters.",
      "A translation, caption, or edited clip can also change meaning without being a deepfake. Compare important claims with the full recording or a trusted source. Ask who created the content and what they want viewers to believe. The format does not remove the need for verification.",
      "Responsible creators label synthetic media and avoid making fake content that could harm a person, community, or emergency response. A clear label helps viewers understand what they are seeing. It supports honest communication."
      ],
      keyTakeaways: ["Misinformation can be accidental or intentional, and synthetic media can make it convincing.", "Check sources, dates, context, and independent evidence before sharing.", "Label synthetic media and avoid creating content that could harm people."]
    },
    {
      id: "impact",
      title: "Environmental and labor impact",
      minutes: 8,
      body: [
      "Training and running large models use electricity and water for data centers. The impact depends on the model, hardware, energy source, and how often it is used. The same tool can have different impacts in different settings.",
      "Many AI systems also rely on people who label data, moderate harmful content, or review outputs. Their work deserves fair pay, safe conditions, and respect. Responsible design includes attention to this hidden labor.",
      "A responsible choice considers whether AI adds enough value to justify its costs. Smaller tools, shorter prompts, reuse, and human methods can sometimes meet the goal with less impact. The best method is the one that meets the need responsibly.",
      "A stakeholder is a person or group affected by a system, including users, workers, neighbors, and people whose data is used. Stakeholders may value different outcomes from the same tool. A project team should hear those concerns before making a choice.",
      "Thinking about impact does not require perfect choices. It means asking who benefits, who pays, and how a system can be improved. Those questions can guide a better next step."
      ],
      keyTakeaways: ["AI systems use physical resources and human labor.", "Smaller or non-AI methods may meet a goal with less impact.", "Responsible choices consider every stakeholder who benefits, works, pays, or bears risk."]
    }
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
      ]},
      { id: "s7", situation: "A classmate asks you to share your login for a school-approved AI tool.", options: [
        { text: "Share it because the classmate promises to log out.", ok: false, feedback: "A login is personal and sharing it can expose your account and school data." },
        { text: "Keep your login private and help them ask the teacher for access.", ok: true, feedback: "Protecting account access and using the school's process respects privacy and safety." },
        { text: "Post the login in the group chat so everyone can use it.", ok: false, feedback: "A group message increases the risk of account misuse and exposes a secret." }
      ]},
      { id: "s8", situation: "Your group uses AI to translate a family member's interview, but one sentence may be wrong.", options: [
        { text: "Use the translation without checking because the tool is fast.", ok: false, feedback: "A mistranslation can change someone's meaning or remove important context." },
        { text: "Ask the speaker or a fluent reviewer to check the important parts.", ok: true, feedback: "Human review protects meaning, consent, and the speaker's voice." },
        { text: "Rewrite the sentence to sound more dramatic.", ok: false, feedback: "Changing a person's words for drama is misleading and disrespectful." }
      ]},
      { id: "s9", situation: "A friend asks a chatbot for help with serious mental-health concerns.", options: [
        { text: "Tell your friend to follow the chatbot's advice alone.", ok: false, feedback: "A chatbot cannot replace qualified care or respond safely to every crisis." },
        { text: "Listen, involve a trusted adult or counselor, and seek urgent help if needed.", ok: true, feedback: "A trusted person and qualified support can respond with care and safety." },
        { text: "Copy the conversation into a public post for advice.", ok: false, feedback: "Sharing a private health conversation can expose your friend's sensitive information." }
      ]}
    ]
  },
  quiz: [
    { id: "e1", prompt: "What should you do when a class rule is unclear?", choices: ["Hide your use", "Ask the teacher before submitting", "Assume all use is allowed", "Copy a friend"], answerIndex: 1, explanation: "Clarifying expectations early protects honest learning." },
    { id: "e2", prompt: "Why can overall accuracy be misleading?", choices: ["It may hide unequal results for a group", "Accuracy has no meaning", "It only measures spelling", "It guarantees fairness"], answerIndex: 0, explanation: "Group-level checks can reveal harm hidden by an average." },
    { id: "e3", prompt: "Which is good privacy practice?", choices: ["Upload private messages", "Minimize identifying data and check policies", "Share passwords", "Use real records for practice"], answerIndex: 1, explanation: "Use the least identifying data necessary and understand how a service handles it." },
    { id: "e4", prompt: "What is a useful deepfake check?", choices: ["Trust a familiar face", "Check original sources and independent evidence", "Share before checking", "Assume detectors are perfect"], answerIndex: 1, explanation: "Source, date, context, and corroboration help evaluate synthetic media." },
    { id: "e5", prompt: "Responsible AI use considers:", choices: ["Only speed", "Who benefits, who is affected, and system costs", "Only how impressive it looks", "Whether nobody asks questions"], answerIndex: 1, explanation: "Ethical choices consider people, resources, and accountability." },
    { id: "e6", prompt: "What is a proxy variable?", choices: ["A clue that can stand in for another trait", "A password for a model", "A perfect fairness test", "A type of computer screen"], answerIndex: 0, explanation: "A proxy variable can carry information about a sensitive trait even when that trait is removed." },
    { id: "e7", prompt: "What is a strong response to a possible mistranslation?", choices: ["Publish it without review", "Ask a fluent speaker or the original speaker to check it", "Make it more dramatic", "Delete the original interview"], answerIndex: 1, explanation: "Human review helps preserve the speaker's meaning and context." },
    { id: "e8", prompt: "What should you do if a friend seeks serious mental-health advice from a chatbot?", choices: ["Keep it secret from every adult", "Involve a trusted adult or counselor", "Share the chat publicly", "Treat the chatbot as a doctor"], answerIndex: 1, explanation: "Qualified, trusted support is safer than relying on a chatbot for serious concerns." }
  ]
};
