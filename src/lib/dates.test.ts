import { describe, expect, it } from "vitest";
import { nearestWeekdayIndex, weekdaysBetween } from "./dates";

describe("weekdaysBetween", () => {
  it("월~금만, 양 끝 포함", () => {
    expect(weekdaysBetween("2026-01-12", "2026-01-18")).toEqual([
      "2026-01-12", "2026-01-13", "2026-01-14", "2026-01-15", "2026-01-16",
    ]);
  });
  it("설정 범위는 2016-01-04 로 시작해 2026-09-17 로 끝난다", () => {
    const days = weekdaysBetween("2016-01-04", "2026-09-17");
    expect(days[0]).toBe("2016-01-04");
    expect(days.at(-1)).toBe("2026-09-17");
    expect(days.length).toBeGreaterThan(2700);
    expect(days.includes("2026-01-17")).toBe(false); // 토요일
  });
});

describe("nearestWeekdayIndex", () => {
  const days = weekdaysBetween("2026-01-12", "2026-01-23");
  it("목록에 있으면 그 자리", () => {
    expect(days[nearestWeekdayIndex(days, "2026-01-15")]).toBe("2026-01-15");
  });
  it("주말이면 직전 금요일", () => {
    expect(days[nearestWeekdayIndex(days, "2026-01-17")]).toBe("2026-01-16");
  });
  it("범위 앞이면 0", () => {
    expect(nearestWeekdayIndex(days, "2025-12-01")).toBe(0);
  });
});
