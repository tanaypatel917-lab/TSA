export const fakePageCopy = {
  title: "This page looks real. Is it?",
  kicker: "Try it",
  instruction: "Read the page. Click anything that seems off.",
  address: "brightside-news.example/science/naps-boost-scores",
  section: "SCIENCE",
  headlineStart: "Students who nap 20 minutes score ",
  statistic: "31% higher",
  headlineEnd: " on tests, study finds",
  bylineName: "Dana Whitfield",
  bylineDetails: " · Science desk · 2 hours ago",
  imageCaption: "Researchers at the Northbridge Institute observed 4,000 students.",
  paragraphOne: "A new study from the Northbridge Institute followed 4,000 high-school students for a full year. Those who took a 20-minute nap after lunch scored 31% higher on end-of-year tests.",
  quote: "It’s the single biggest effect we’ve ever measured",
  quoteAfter: " said lead researcher Dr. Lena Moss. Schools in three states are already adding nap rooms.",
  shareStart: "Shared ",
  shareCount: "48,200 times",
  figcaption: "Fake pages copy the look of real news. The look is easy to fake; the sources behind it are not.",
  hoodSpec: "Model: none · Data: one page we invented, with 5 planted clues · Runs on your device",
  hoodIntro: "Every clue was planted on purpose:",
  cluesFoundHeading: "Clues found",
  emptyClues: "No clues found yet.",
  revealButton: "Reveal the truth",
  stamp: "THIS DOESN'T EXIST.",
  revealHeading: "The truth",
  revealParagraph: "We made this page up for this lesson. There is no study, reporter or institute, and every name is invented. Tools that generate text and images make pages like this fast and cheap.",
  reviewHeading: "What tipped you off?",
  checksHeading: "How to check a claim like this",
  checks: [
    "Search the claim and see who else reports it.",
    "Look for a link to the original study.",
    "Check that the site and the reporter exist elsewhere."
  ],
  retryButton: "Try again"
} as const;

export const fakePageClues = [
  { id: "address", name: "Address", note: "The site name isn't one you can look up. Search it: no history, no about page, no other outlet reporting this." },
  { id: "byline", name: "Byline", note: "Search the reporter. No other articles exist. Made-up bylines are common on AI-generated pages." },
  { id: "statistic", name: "31% statistic", note: "A big, exact number with no link to the study. Real reporting links the paper or names the journal." },
  { id: "quote", name: "Quote", note: "A dramatic quote from someone you can't verify. Check whether the person and the institute exist." },
  { id: "shares", name: "Share count", note: "Lots of shares shows it spread, not that it's true." }
] as const;

export type FakePageClueId = (typeof fakePageClues)[number]["id"];

export const fakePageRevealThreshold = 3;

export function shouldRevealFakePage(foundCount: number): boolean {
  return foundCount >= fakePageRevealThreshold;
}
