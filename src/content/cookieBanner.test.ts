import { describe, expect, it } from "vitest";
import { GETS, PARTNER_COUNT, PARTNER_PURPOSES, partnerSample, morePartnersText, TRICKS } from "./cookieBanner";

describe("cookie banner content", () => {
  it("builds deterministic, unique invented partner samples", () => {
    const first = partnerSample(12);
    expect(partnerSample(12)).toEqual(first);
    expect(first).toHaveLength(12);
    expect(new Set(first.map((partner) => partner.name)).size).toBe(12);
    expect(first.every((partner) => partner.legitimateInterest)).toBe(true);
    expect(first.map((partner) => partner.purpose)).toEqual(first.map((_, index) => PARTNER_PURPOSES[index % PARTNER_PURPOSES.length]));
  });

  it("explains four tricks and four kinds of data", () => {
    expect(TRICKS).toHaveLength(4);
    expect(TRICKS.map(({ id }) => id)).toEqual(["bright", "hidden-reject", "hidden-partners", "pre-on"]);
    expect(GETS).toEqual([
      "Your IP address (roughly where you are)",
      "The page you're reading and when",
      "Your device and browser type",
      "An ID that can follow you to other sites"
    ]);
  });

  it("counts the remaining partners after the sample", () => {
    expect(PARTNER_COUNT - 12).toBe(835);
    expect(morePartnersText(12)).toBe("…and 835 more");
  });
});
