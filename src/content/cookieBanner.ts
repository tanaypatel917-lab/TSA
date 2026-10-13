export const COOKIE_SITE = {
  name: "QuizFlash · free study cards",
  address: "quizflash.example/cards/biology"
};

export const COOKIE_COPY = {
  title: "Who's watching this page?",
  bannerTitle: "We value your privacy",
  bannerBody: "We and our partners use cookies to improve your experience.",
  note: "Real cookie banners often list hundreds of partners. Before you click Accept, ask who gets your data and what for."
};

export const PARTNER_COUNT = 847;

const partnerPrefixes = ["Pixel", "Beacon", "Cookie", "Echo", "Signal", "Orbit", "Tag", "Cloud"];
const partnerSuffixes = ["Hound", "Jar", "Nest", "Loop", "Works", "Lab"];

export const PARTNER_PURPOSES = [
  "Measure ad clicks",
  "Build an interest profile",
  "Precise location",
  "Match you across devices",
  "Personalised ads",
  "Sell audience data"
] as const;

export type CookiePartner = {
  name: string;
  purpose: typeof PARTNER_PURPOSES[number];
  legitimateInterest: boolean;
};

export function partnerSample(count: number) {
  return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index): CookiePartner => ({
    name: `${partnerPrefixes[index % partnerPrefixes.length]} ${partnerSuffixes[Math.floor(index / partnerPrefixes.length) % partnerSuffixes.length]}`,
    purpose: PARTNER_PURPOSES[index % PARTNER_PURPOSES.length],
    legitimateInterest: true
  }));
}

export const TRICKS = [
  { id: "bright", label: "Accept is big and bright", text: "The button they want you to press is the easiest to see." },
  { id: "hidden-reject", label: "Reject is a grey link", text: "Saying no is made small and easy to miss." },
  { id: "hidden-partners", label: "Partners are behind a link", text: "847 companies, but you only see them if you go looking." },
  { id: "pre-on", label: "Switches start on", text: "'Legitimate interest' lets partners use your data unless you switch each one off." }
] as const;

export const GETS = [
  "Your IP address (roughly where you are)",
  "The page you're reading and when",
  "Your device and browser type",
  "An ID that can follow you to other sites"
] as const;

export function morePartnersText(shown: number) {
  return `…and ${Math.max(0, PARTNER_COUNT - shown)} more`;
}
