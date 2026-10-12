import { describe, expect, it } from "vitest";
import { countTokens } from "./TokenLoader";

describe("token loader", () => {
  it("counts the displayed token pieces", () => {
    expect(countTokens(["Build", "ing", " the", " is", "land"])).toBe(5);
  });
});
