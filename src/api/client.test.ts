import { describe, expect, it } from "vitest";
import { api, isApiError } from "./client";
import { ApiError, defaultRequest, setRunDelay } from "@/demo/adapter";
import { resetSaved } from "@/demo/saved";

setRunDelay(() => 0);

describe("api", () => {
  it("설정, 실행, 저장, 목록, 세션 다섯 가지가 있다", async () => {
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
});
