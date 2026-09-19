import { describe, expect, it } from "vitest";
import { defaultRequest, getConfig, getEvents, getNews, getSession, login, runLab } from "./adapter";

describe("adapter", () => {
  it("기본 요청은 설정의 기본값으로 만든다", () => {
    const req = defaultRequest();
    expect(req.asOf).toBe("2026-01-15");
    expect(req.horizonDays).toBe(20);
    expect(req.regressWindow).toBe(250);
    expect(req.bandMethod).toBe("MONTE_CARLO");
    expect(req.rounds).toEqual(getConfig().defaults);
    expect(req.rounds).not.toBe(getConfig().defaults);
  });

  it("지연 0으로 실행하면 바로 결과가 온다", async () => {
    const t0 = Date.now();
    const out = await runLab(defaultRequest(), { delayMs: 0 });
    expect(Date.now() - t0).toBeLessThan(200);
    expect(out.asOf).toBe("2026-01-15");
  });

  it("뉴스는 30일로 잘리고 일정은 기본 20일", () => {
    expect(getNews("2026-01-15", 99).items.length).toBe(getNews("2026-01-15", 30).items.length);
    expect(getEvents("2026-01-15").horizonDays).toBe(20);
  });

  it("로그인과 세션은 데모 사용자", () => {
    expect(login().accessToken).toBe("demo");
    expect(getSession().loginId).toBe("demo");
  });
});
