import { describe, expect, it } from "vitest";
import { formatDate, formatPct, formatPp, horizonLabel } from "./format";

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

describe("horizonLabel", () => {
  it("원본 매핑: 5 1주, 10 2주, 20 1개월", () => {
    expect(horizonLabel(5)).toBe("1주");
    expect(horizonLabel(10)).toBe("2주");
    expect(horizonLabel(20)).toBe("1개월");
  });
  it("매핑에 없으면 N거래일", () => {
    expect(horizonLabel(1)).toBe("1거래일");
    expect(horizonLabel(22)).toBe("22거래일");
  });
});

describe("formatDate", () => {
  it("그 자리의 달력 날짜를 준다 (UTC 날짜가 아니라)", () => {
    // KST 라면 이 시각의 toISOString 은 2026-09-12T16:00:00Z — slice 하면 하루 전이다
    expect(formatDate(new Date(2026, 8, 13, 1, 0).toISOString())).toBe("2026-09-13");
  });
  it("자정 언저리도 그 자리 기준으로 (시간대와 무관)", () => {
    expect(formatDate(new Date(2026, 0, 1, 0, 0).toISOString())).toBe("2026-01-01");
    expect(formatDate(new Date(2025, 11, 31, 23, 59).toISOString())).toBe("2025-12-31");
  });
  it("한 자리 월/일은 0 을 채운다", () => {
    expect(formatDate(new Date(2026, 2, 5, 12, 0).toISOString())).toBe("2026-03-05");
  });
});
