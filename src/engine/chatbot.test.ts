import { describe, expect, it } from "vitest";
import { pipFallback, pipRules } from "@/content/chatbot";
import { chatReply, type ChatRule } from "./chatbot";

const cases: [string, string | null, string | null][] = [
  ["Hello!", "greet", "hello"],
  ["What's for lunch?", "lunch", "lunch"],
  ["I'm not stressed at all", "feelings", "stressed"],
  ["I like books but I hate the library", "library", "library"],
  ["Can you explain photosynthesis?", null, null],
  ["this is it", null, null],
  ["hit", null, null],
  ["HEY", "greet", "hey"],
  ["thanksgiving plans", null, null],
  ["", null, null],
  ["  \t  ", null, null]
];

describe("scripted chatbot replies", () => {
  it.each(cases)("%s selects the expected rule", (message, ruleId, matched) => {
    const result = chatReply(message, pipRules, pipFallback);
    expect(result.rule?.id ?? null).toBe(ruleId);
    expect(result.matched).toBe(matched);
    expect(result.text).toBe(ruleId ? pipRules.find((rule) => rule.id === ruleId)?.reply : pipFallback);
  });

  it("uses the first matching rule in array order", () => {
    const rules: ChatRule[] = [
      { id: "first", keywords: ["coffee", "tea"], reply: "First rule" },
      { id: "second", keywords: ["coffee"], reply: "Second rule" }
    ];
    expect(chatReply("tea, then coffee", rules, pipFallback)).toEqual({
      rule: rules[0],
      matched: "coffee",
      text: "First rule"
    });
  });
});
