import { describe, expect, it } from "vitest";
import { formatPct, formatPp } from "./format";

describe("formatPct", () => {
  it("양수는 + 부호와 소수 한 자리", () => {
    expect(formatPct(0.0066)).toBe("+0.7%");
  });
  it("음수는 U+2212 부호", () => {
    expect(formatPct(-0.0059)).toBe("−0.6%");
  });
  it("0은 +0.0%", () => {
    expect(formatPct(0)).toBe("+0.0%");
  });
  it("없으면 em dash", () => {
    expect(formatPct(null)).toBe("—");
    expect(formatPct(undefined)).toBe("—");
  });
});

describe("formatPp", () => {
  it("퍼센트포인트 접미", () => {
    expect(formatPp(0.0125)).toBe("+1.3%p");
    expect(formatPp(-0.003)).toBe("−0.3%p");
    expect(formatPp(null)).toBe("—");
  });
});
