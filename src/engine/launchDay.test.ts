import { describe, expect, it } from "vitest";
import { LAUNCH_NODES } from "../content/launchDay";
import { launchEnding } from "./launchDay";

const correctChoices = LAUNCH_NODES.map((node) => node.choices.findIndex((choice) => choice.trust === 1));
const wrongChoices = LAUNCH_NODES.map((node) => node.choices.findIndex((choice) => choice.trust === -2));

function trustForPath(choices: number[]) {
  return choices.reduce((total, choiceIndex, nodeIndex) => total + LAUNCH_NODES[nodeIndex].choices[choiceIndex].trust, 0);
}

describe("Launch day endings", () => {
  it("trusts the all-good path at +4", () => {
    expect(trustForPath(correctChoices)).toBe(4);
    expect(launchEnding(trustForPath(correctChoices)).id).toBe("trusted");
  });

  it("patches three good choices and one bad choice at +1", () => {
    const path = [...correctChoices];
    path[0] = wrongChoices[0];
    expect(trustForPath(path)).toBe(1);
    expect(launchEnding(trustForPath(path)).id).toBe("patched");
  });

  it("patches two good choices and two bad choices at −2", () => {
    const path = [wrongChoices[0], correctChoices[1], wrongChoices[2], correctChoices[3]];
    expect(trustForPath(path)).toBe(-2);
    expect(launchEnding(trustForPath(path)).id).toBe("patched");
  });

  it("pulls a path with one good choice at −5", () => {
    const path = [correctChoices[0], wrongChoices[1], wrongChoices[2], wrongChoices[3]];
    expect(trustForPath(path)).toBe(-5);
    expect(launchEnding(trustForPath(path)).id).toBe("pulled");
  });

  it("pulls a path with no good choices at −8", () => {
    expect(trustForPath(wrongChoices)).toBe(-8);
    expect(launchEnding(trustForPath(wrongChoices)).id).toBe("pulled");
  });

  it("gives every node exactly one +1 choice", () => {
    for (const node of LAUNCH_NODES) {
      expect(node.choices.filter((choice) => choice.trust === 1)).toHaveLength(1);
    }
  });
});
