import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/api/client";
import { experimentVerdict, selectedHits } from "@/demo/verdict";
import { useFixedRun } from "./fixed-run";

afterEach(() => vi.restoreAllMocks());

describe("useFixedRun", () => {
  it("상위 스펙 5.4 고정 시드의 결과를 낸다", async () => {
    const { result } = renderHook(() => useFixedRun());
    await waitFor(() => expect(result.current.run.status).toBe("ok"));
    const run = result.current.run;
    if (run.status !== "ok") throw new Error("ok 여야 한다");
    const r = run.result;

    expect(r.asOf).toBe("2026-01-15");
    expect(r.horizonDays).toBe(20);
    expect(r.round1.estimates.filter((s) => s.selected).map((s) => s.name))
      .toEqual(["필수소비재", "의료", "금융"]);
    expect(experimentVerdict(r)).toBe("SUCCESS");
    expect(selectedHits(r.round1.estimates)).toEqual({ hits: 2, total: 3 });
    expect(r.horizonReached).toBe(true);
  });

  it("경로는 시장 1 + 업종 11 + 종목 11, 표본은 24개다", async () => {
    const { result } = renderHook(() => useFixedRun());
    await waitFor(() => expect(result.current.run.status).toBe("ok"));
    const run = result.current.run;
    if (run.status !== "ok") throw new Error("ok 여야 한다");
    const subjects = run.result.paths.subjects;
    expect(subjects.filter((s) => s.round === 0)).toHaveLength(1);
    expect(subjects.filter((s) => s.round === 1)).toHaveLength(11);
    expect(subjects.filter((s) => s.round === 2)).toHaveLength(11);
    expect(subjects[0].samples).toHaveLength(24);
    expect(run.result.paths.dates).toHaveLength(21);
  });

  it("실행이 실패하면 error 로 가고 다시 시도로 되돌아온다", async () => {
    const spy = vi.spyOn(api, "run").mockRejectedValueOnce(new Error("nope"));
    const { result } = renderHook(() => useFixedRun());
    await waitFor(() => expect(result.current.run.status).toBe("error"));
    spy.mockRestore();
    result.current.retry();
    await waitFor(() => expect(result.current.run.status).toBe("ok"));
  });
});
