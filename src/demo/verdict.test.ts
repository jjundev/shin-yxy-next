import { describe, expect, it } from "vitest";
import { defaultRequest } from "./adapter";
import * as gen from "./generated/adapter";
import { excessReturn, experimentVerdict, selectedHits, subjectVerdict } from "./verdict";

function run(asOf: string) {
  return gen.runLab({ ...defaultRequest(), asOf });
}

describe("experimentVerdict", () => {
  it("2026-01-15 는 시장보다 더 벌어 성공", () => {
    const r = run("2026-01-15");
    expect(excessReturn(r)).toBeCloseTo(0.0125, 4);
    expect(experimentVerdict(r)).toBe("SUCCESS");
  });
  it("2025-04-15 는 실패", () => {
    expect(experimentVerdict(run("2025-04-15"))).toBe("FAIL");
  });
  it("2025-10-15 와 2024-01-15 는 성공", () => {
    expect(experimentVerdict(run("2025-10-15"))).toBe("SUCCESS");
    expect(experimentVerdict(run("2024-01-15"))).toBe("SUCCESS");
  });
  it("확인 기간이 안 지났으면 채점 전", () => {
    expect(experimentVerdict({ horizonReached: false, avgReturn: 0.01, benchReturn: 0 })).toBe(
      "PENDING",
    );
    expect(experimentVerdict({ horizonReached: true, avgReturn: null, benchReturn: null })).toBe(
      "PENDING",
    );
  });
});

describe("subjectVerdict", () => {
  const base = { center: 0.017, low80: -0.0343, high80: 0.0697 };
  it("방향 맞고 범위 안이면 성공", () => {
    expect(subjectVerdict({ ...base, actual: 0.026 })).toBe("SUCCESS");
  });
  it("방향만 맞으면 방향만 맞음", () => {
    expect(subjectVerdict({ ...base, actual: 0.09 })).toBe("DIRECTION_ONLY");
  });
  it("방향이 틀리면 실패", () => {
    expect(subjectVerdict({ ...base, actual: -0.003 })).toBe("FAIL");
  });
  it("실제가 없으면 채점 전", () => {
    expect(subjectVerdict({ ...base, actual: null })).toBe("PENDING");
  });
});

// 방향 판정은 원본 표와 같이 2라운드(1등 종목 층)를 본다
describe("selectedHits", () => {
  it("2026-01-15 뽑은 업종 셋 중 둘이 방향 적중", () => {
    expect(selectedHits(run("2026-01-15").round2.estimates)).toEqual({ hits: 2, total: 3 });
  });
  it("2025-10-15 는 셋 다", () => {
    expect(selectedHits(run("2025-10-15").round2.estimates)).toEqual({ hits: 3, total: 3 });
  });
});
