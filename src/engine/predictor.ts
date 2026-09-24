export type Guess = { word: string; p: number };
export type Model = { unigram: Map<string, number>; bigram: Map<string, Map<string, number>>; trigram: Map<string, Map<string, number>> };

const START = "<s>";
export const END = ".";

export function tokenize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9'.\s]/g, " ").replace(/\./g, " . ").split(/\s+/).filter(Boolean);
}

function bump(table: Map<string, Map<string, number>>, key: string, word: string) {
  const row = table.get(key) ?? new Map<string, number>();
  row.set(word, (row.get(word) ?? 0) + 1);
  table.set(key, row);
}

export function train(sentences: readonly string[]): Model {
  const model: Model = { unigram: new Map(), bigram: new Map(), trigram: new Map() };
  for (const sentence of sentences) {
    const tokens = [START, START, ...tokenize(sentence)];
    for (let index = 2; index < tokens.length; index += 1) {
      const word = tokens[index];
      model.unigram.set(word, (model.unigram.get(word) ?? 0) + 1);
      bump(model.bigram, tokens[index - 1], word);
      bump(model.trigram, `${tokens[index - 2]} ${tokens[index - 1]}`, word);
    }
  }
  return model;
}

export function predict(model: Model, context: readonly string[], limit = 4): { guesses: Guess[]; source: "trigram" | "bigram" | "unigram" | "done" } {
  const tokens = [START, START, ...context];
  const last = tokens[tokens.length - 1];
  if (last === END) return { guesses: [], source: "done" };
  const pair = `${tokens[tokens.length - 2]} ${last}`;
  const trigram = model.trigram.get(pair);
  const bigram = model.bigram.get(last);
  const [row, source] = trigram ? [trigram, "trigram" as const] : bigram ? [bigram, "bigram" as const] : [model.unigram, "unigram" as const];
  const total = [...row.values()].reduce((sum, count) => sum + count, 0);
  const guesses = [...row.entries()].map(([word, count]) => ({ word, p: count / total })).sort((a, b) => b.p - a.p || a.word.localeCompare(b.word)).slice(0, limit);
  return { guesses, source };
}

export function pick(guesses: readonly Guess[], temperature: number, random: () => number = Math.random) {
  if (!guesses.length) return null;
  if (temperature <= 0.05) return guesses[0].word;
  const weights = guesses.map((guess) => Math.pow(guess.p, 1 / temperature));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = random() * total;
  for (let index = 0; index < guesses.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) return guesses[index].word;
  }
  return guesses[guesses.length - 1].word;
}
