import { describe, expect, it, vi } from "vitest";
import { api, isApiError } from "./client";
import { ApiError, defaultRequest, setRunDelay } from "@/demo/adapter";
import { resetSaved } from "@/demo/saved";

setRunDelay(() => 0);

describe("api", () => {
  it("설정, 실행, 저장, 목록, 세션 화면이 쓰는 것 전부가 있다", async () => {
    resetSaved();
    const config = await api.config();
    expect(config.asofChoices).toHaveLength(40);
    const req = defaultRequest(config);
    const result = await api.run(req);
    expect(result.asOf).toBe("2026-01-15");
    const saved = await api.save(req, result);
    expect((await api.saved())[0].id).toBe(saved.id);
    expect((await api.session()).loginId).toBe("demo");
    expect((await api.login()).accessToken).toBe("demo");
  });

  it("isApiError 는 ApiError 만 참", () => {
    expect(isApiError(new ApiError(403, "no"))).toBe(true);
    expect(isApiError(new Error("no"))).toBe(false);
  });

  it("뉴스와 일정을 준다", async () => {
    const news = await api.news("2026-01-15");
    expect(news.items.length).toBeGreaterThan(0);
    const events = await api.events("2026-01-15", 20);
    expect(events.known.length + events.unknown.length).toBeGreaterThan(0);
  });

  it("기본 요청은 고정 입력이다", () => {
    const req = api.defaultRequest();
    expect(req.asOf).toBe("2026-01-15");
    expect(req.horizonDays).toBe(20);
  });

  it("저장 변경을 구독한다", async () => {
    const fn = vi.fn();
    const off = api.onSavedChange(fn);
    await api.save(api.defaultRequest(), await api.run(api.defaultRequest()));
    expect(fn).toHaveBeenCalledTimes(1);
    off();
  });
});
