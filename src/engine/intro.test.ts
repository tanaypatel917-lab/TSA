import { describe, expect, it } from "vitest";
import { shouldOfferIntro } from "./intro";

describe("first-visit intro", () => {
  it.each(["/", ""])("offers the intro at the home path %j", (pathname) => {
    expect(shouldOfferIntro(pathname)).toBe(true);
  });

  it.each(["/play/", "/play", "/intro/", "/modules/basics/", "/glossary/"])("does not offer the intro at %s", (pathname) => {
    expect(shouldOfferIntro(pathname)).toBe(false);
  });
});
