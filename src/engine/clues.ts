export type Clue = { label: string; pattern: string };
export type Label = "spam" | "not-spam";

export function tallyClues(items: { text: string }[], labels: Label[], clues: Clue[]) {
  return clues.map((clue) => {
    const match = new RegExp(clue.pattern, "i");
    const count = (label: Label) => labels.filter((value, index) => value === label && match.test(items[index]?.text ?? "")).length;
    return { label: clue.label, spam: count("spam"), notSpam: count("not-spam") };
  });
}

export function markClues(text: string, clues: Clue[]): { text: string; clue: boolean }[] {
  if (!clues.length) return [{ text, clue: false }];
  const combined = new RegExp(clues.map((clue) => `(?:${clue.pattern})`).join("|"), "gi");
  const parts: { text: string; clue: boolean }[] = [];
  let last = 0;
  for (const match of text.matchAll(combined)) {
    const start = match.index ?? 0;
    if (!match[0]) continue;
    if (start > last) parts.push({ text: text.slice(last, start), clue: false });
    parts.push({ text: match[0], clue: true });
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), clue: false });
  return parts;
}
