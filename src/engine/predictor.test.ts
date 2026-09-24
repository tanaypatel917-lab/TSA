import { describe, expect, it } from "vitest";
import { predictorCorpus, predictorStarters } from "@/content/predictor";
import { pick, predict, tokenize, train } from "./predictor";

const model = train(predictorCorpus);

describe("next-word predictor", () => {
  it("splits text into lowercase word and period tokens", () => {
    expect(tokenize("AI can, find patterns.")).toEqual(["ai", "can", "find", "patterns", "."]);
  });

  it("ranks next words by how often they followed the last two words", () => {
    const { guesses, source } = predict(model, tokenize("AI can"));
    expect(source).toBe("trigram");
    expect(guesses[0]).toEqual({ word: "find", p: 3 / 11 });
    expect(guesses.map((guess) => guess.p)).toEqual([...guesses.map((guess) => guess.p)].sort((a, b) => b - a));
  });

  it("backs off to one word of context, then to overall word counts", () => {
    expect(predict(model, tokenize("my data")).source).toBe("bigram");
    expect(predict(model, tokenize("zebra")).source).toBe("unigram");
    expect(predict(model, tokenize("AI can be wrong.")).source).toBe("done");
  });

  it("every starter has guesses and every guess path ends in a sentence", () => {
    for (const starter of predictorStarters) {
      let context = tokenize(starter);
      for (let step = 0; step < 20 && context[context.length - 1] !== "."; step += 1) context = [...context, pick(predict(model, context).guesses, 0)!];
      expect(context[context.length - 1]).toBe(".");
    }
  });

  it("temperature zero always takes the top guess and higher temperatures can choose others", () => {
    const { guesses } = predict(model, tokenize("A good prompt"));
    expect(pick(guesses, 0)).toBe(guesses[0].word);
    expect(pick(guesses, 1.5, () => 0.999)).toBe(guesses[guesses.length - 1].word);
    expect(pick([], 1)).toBeNull();
  });
});
