export type LaunchChoice = { label: string; trust: 1 | -2; feedback: string };
export type LaunchNode = { id: string; tag: string; situation: string; choices: [LaunchChoice, LaunchChoice] };
export type LaunchEnding = { id: "trusted" | "patched" | "pulled"; title: string; text: string };

export const LAUNCH_INTRO = "Your team is building Club Finder, a chatbot that helps students pick clubs at Friday's club fair. Four decisions stand between you and launch.";

export const LAUNCH_NODES: LaunchNode[] = [
  {
    id: "data",
    tag: "Monday · Data",
    situation: "You need club information. A teammate suggests pasting the whole student directory into the AI tool so it can match students to clubs.",
    choices: [
      { label: "Paste the directory. It's faster.", trust: -2, feedback: "That shares classmates' names and emails with an outside tool, without asking them." },
      { label: "Use only the public club list, and let students opt in.", trust: 1, feedback: "Less data, same goal. That's privacy by design." }
    ]
  },
  {
    id: "facts",
    tag: "Tuesday · Facts",
    situation: "The bot says Robotics Club meets on Tuesdays. The club's poster says Thursdays.",
    choices: [
      { label: "Ship it. The bot sounds sure.", trust: -2, feedback: "Sounding sure isn't evidence. Students would show up on the wrong day." },
      { label: "Check every meeting time with the club advisors.", trust: 1, feedback: "Slower, but now every answer has a source you can point to." }
    ]
  },
  {
    id: "fairness",
    tag: "Wednesday · Fairness",
    situation: "Testing shows the bot suggests sports clubs to boys and art clubs to girls.",
    choices: [
      { label: "Remove the gender question and retest with a mixed group of students.", trust: 1, feedback: "Testing with the people affected catches patterns your team missed." },
      { label: "Leave it. They're only suggestions.", trust: -2, feedback: "A small nudge repeated to hundreds of students becomes a pattern." }
    ]
  },
  {
    id: "credit",
    tag: "Thursday · Credit",
    situation: "Your teacher asks how you built Club Finder.",
    choices: [
      { label: "Show your project record: prompts, checks, and what AI did.", trust: 1, feedback: "Clear credit lets others trust the work and learn from it." },
      { label: "Say you built it all yourselves.", trust: -2, feedback: "Hiding AI help breaks academic integrity, even when the project works." }
    ]
  }
];

export const LAUNCH_ENDINGS: LaunchEnding[] = [
  { id: "trusted", title: "Trusted launch", text: "Club Finder launches at the fair. When a parent asks how it works, your project record answers them. It took longer to build, and it's easy to trust." },
  { id: "patched", title: "Launch with patches", text: "Club Finder launches, but you spend the fair fixing answers by hand. Every check you skipped came back as work." },
  { id: "pulled", title: "Pulled from the fair", text: "A student finds a classmate's email in the bot's answers, and the advisor shuts it down. Going fast got you there first. Losing trust sent you home." }
];
