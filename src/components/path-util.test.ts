import { describe, expect, it } from "vitest";
import { hasActual, lastActual } from "./path-util";
import type { PathSubject } from "@/demo/types";

const base: PathSubject = {
  round: 1, subjectId: 1, name: "x", selected: false, center: 0, low80: 0, high80: 0,
  upProbability: 0.5, acceptRate: null, expected: [0, 0.1], low: [0, 0], high: [0, 0.2],
  samples: [], fates: [], actual: [],
};

describe("hasActual", () => {
  it("두 점 이상이면 실제 움직임이 있다", () => {
    expect(hasActual([0, 0.01])).toBe(true);
    expect(hasActual([0])).toBe(false);
    expect(hasActual([])).toBe(false);
    expect(hasActual(null)).toBe(false);
    expect(hasActual(undefined)).toBe(false);
  });
  it("lastActual 은 hasActual 을 따른다", () => {
    expect(lastActual(base)).toBeNull();
    expect(lastActual({ ...base, actual: [0, 0.03] })).toBe(0.03);
  });
});
