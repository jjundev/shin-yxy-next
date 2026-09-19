import { describe, expect, it } from "vitest";
import * as gen from "./generated/adapter";

const request = {
  asOf: "2026-01-15",
  horizonDays: 20,
  regressWindow: 250,
  bandMethod: "MONTE_CARLO" as const,
  rounds: gen.config.defaults,
};

describe("추출한 데모 생성기", () => {
  it("설정이 원본과 같다", () => {
    expect(gen.config.asofChoices).toHaveLength(40);
    expect(gen.config.asofChoices[gen.config.defaultAsofIndex]).toBe("2026-01-15");
    expect(gen.config.dataStart).toBe("2016-01-04");
    expect(gen.config.dataEnd).toBe("2026-09-17");
    expect(gen.config.modules.map((m) => m.key)).toEqual([
      "seas", "cal", "evt", "newsdir", "garch", "mgarch", "vkospi", "limit", "circuit",
    ]);
    expect(gen.sectors).toHaveLength(11);
  });

  it("2026-01-15 실행이 원본 화면과 같은 결과를 낸다", () => {
    const out = gen.runLab(request);
    const picked = out.round1.estimates.filter((s) => s.selected).map((s) => s.name);
    expect(picked.sort()).toEqual(["금융", "의료", "필수소비재"].sort());
    expect(out.rows.filter((r) => r.selected).map((r) => r.name).sort()).toEqual(
      ["KB금융", "KT&G", "삼성바이오로직스"].sort(),
    );
    expect(out.avgReturn).toBeCloseTo(0.0066, 4);
    expect(out.benchReturn).toBeCloseTo(-0.0059, 4);
    expect(out.costDrag).toBeCloseTo(0.003, 4);
    expect(out.horizonReached).toBe(true);
    expect(out.rows).toHaveLength(11);
    expect(out.round1.estimates).toHaveLength(11);
  });

  it("같은 입력은 같은 결과", () => {
    expect(JSON.stringify(gen.runLab(request))).toBe(JSON.stringify(gen.runLab(request)));
  });

  it("뉴스와 일정도 형태가 맞고 결정적이다", () => {
    const n = gen.news("2026-01-15", 7);
    expect(n.items.length).toBeGreaterThan(0);
    expect(n.items[0]).toHaveProperty("judgments");
    expect(JSON.stringify(gen.news("2026-01-15", 7))).toBe(JSON.stringify(n));

    const e = gen.events("2026-01-15", 20);
    expect(Array.isArray(e.known)).toBe(true);
    expect(Array.isArray(e.unknown)).toBe(true);
    expect(e.horizonDays).toBe(20);
  });

  it("데모 사용자", () => {
    expect(gen.demoUser.loginId).toBe("demo");
  });
});
