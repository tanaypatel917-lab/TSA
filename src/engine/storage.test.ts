import { describe, expect, it } from "vitest";
import { exportProgress, importProgress } from "./storage";
import { initialState } from "./progress";

describe("storage serialization", () => {
  it("rejects garbage and wrong versions", () => {
    expect(importProgress("nope")).toBeNull();
    expect(importProgress(JSON.stringify({ ...initialState, version: 2 }))).toBeNull();
  });
  it("round trips valid progress", () => {
    expect(importProgress(exportProgress({ ...initialState, xp: 20 }))).toMatchObject({ xp: 20, version: 1 });
  });
});
