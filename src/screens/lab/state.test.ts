import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { api } from "@/api/client";
import { ApiError, getConfig, setRunDelay } from "@/demo/adapter";
import * as gen from "@/demo/generated/adapter";
import { resetSaved } from "@/demo/saved";
import {
  canSave, initialLabState, isDirty, labReducer, moduleState, roundsOf, useLab, type LabState,
} from "./state";

vi.mock("sonner", () => ({ toast: vi.fn() }));
setRunDelay(() => 0);

const config = getConfig();
const modOf = (key: string) => config.modules.find((m) => m.key === key)!;

function fresh(): LabState {
  return initialLabState(config, api.defaultRequest(config));
}

beforeEach(() => {
  resetSaved();
  vi.mocked(toast).mockClear();
  vi.restoreAllMocks();
});

describe("labReducer", () => {
  it("초기 상태는 고정 입력, 결과 없음, 시장 집중 없음", () => {
    const s = fresh();
    expect(s.request.asOf).toBe("2026-01-15");
    expect(s.result).toBeNull();
    expect(s.status).toBe("idle");
    expect(s.layer).toBe(1);
    expect(isDirty(s)).toBe(false);
    expect(canSave(s)).toBe(false);
  });

  it("roundsOf 는 MSI 문자를 라운드 키로 바꾼다", () => {
    expect(roundsOf(modOf("cal"))).toEqual(["0", "1", "2"]);
    expect(roundsOf(modOf("seas"))).toEqual(["1", "2"]);
    expect(roundsOf(modOf("vkospi"))).toEqual(["0"]);
  });

  it("모듈 토글은 그 모듈이 도는 라운드 전부에 적용된다", () => {
    let s = fresh();
    expect(moduleState(s.request, modOf("seas"))).toEqual({ on: 0, of: 2 });
    s = labReducer(s, { type: "module", keys: ["seas"], on: true });
    expect(s.request.rounds["1"].modules.seas.on).toBe(true);
    expect(s.request.rounds["2"].modules.seas.on).toBe(true);
    expect(s.request.rounds["0"].modules.seas).toBeUndefined();
    expect(moduleState(s.request, modOf("seas"))).toEqual({ on: 2, of: 2 });
    s = labReducer(s, { type: "module", keys: ["cal", "evt"], on: false });
    expect(s.request.rounds["0"].modules.cal.on).toBe(false);
    expect(s.request.rounds["2"].modules.evt.on).toBe(false);
  });

  it("결과가 오면 dirty 가 풀리고 시장에 집중하며, 설정을 바꾸면 다시 dirty", () => {
    let s = fresh();
    s = labReducer(s, { type: "run:start" });
    expect(s.status).toBe("running");
    const result = gen.runLab(s.request);
    s = labReducer(s, { type: "run:ok", request: s.request, result });
    expect(s.status).toBe("idle");
    expect(isDirty(s)).toBe(false);
    expect(s.focus).toEqual({ round: 0, subjectId: 0 });
    expect(s.mode).toBe("actual");
    expect(canSave(s)).toBe(true);
    s = labReducer(s, { type: "horizon", value: 5 });
    expect(isDirty(s)).toBe(true);
    expect(s.result).toBe(result); // 결과는 유지
  });

  it("층을 바꾸면 다른 층에 걸린 집중은 시장으로 돌아가고, 같은 층이면 그대로다", () => {
    let s = fresh();
    s = labReducer(s, { type: "run:ok", request: s.request, result: gen.runLab(s.request) });
    s = labReducer(s, { type: "focus", value: { round: 1, subjectId: 5 } });
    const sameLayer = labReducer(s, { type: "layer", value: 1 });
    expect(sameLayer.focus).toEqual({ round: 1, subjectId: 5 });
    const otherLayer = labReducer(s, { type: "layer", value: 2 });
    expect(otherLayer.focus).toEqual({ round: 0, subjectId: 0 });
  });

  it("실패하면 결과를 지우고 메시지를 든다", () => {
    let s = fresh();
    s = labReducer(s, { type: "run:ok", request: s.request, result: gen.runLab(s.request) });
    s = labReducer(s, { type: "run:fail", message: "실행 실패" });
    expect(s.status).toBe("error");
    expect(s.error).toBe("실행 실패");
    expect(s.result).toBeNull();
  });

  it("저장하면 같은 결과는 다시 저장 못 하고, 새 결과가 오면 다시 된다", () => {
    let s = fresh();
    const r1 = gen.runLab(s.request);
    s = labReducer(s, { type: "run:ok", request: s.request, result: r1 });
    s = labReducer(s, { type: "saved", result: r1 });
    expect(canSave(s)).toBe(false);
    const r2 = gen.runLab({ ...s.request, asOf: "2025-10-15" });
    s = labReducer(s, { type: "run:ok", request: { ...s.request, asOf: "2025-10-15" }, result: r2 });
    expect(canSave(s)).toBe(true);
  });
});

describe("useLab", () => {
  it("설정을 읽고, 계산하면 결과가 오고, 저장하면 토스트를 띄운다", async () => {
    const { result } = renderHook(() => useLab());
    await waitFor(() => expect(result.current.state).not.toBeNull());
    await act(() => result.current.run());
    expect(result.current.state?.result?.asOf).toBe("2026-01-15");
    await act(() => result.current.save());
    expect(toast).toHaveBeenCalledWith("저장됨 · 2026-01-15", { id: "saved" });
    expect(canSave(result.current.state!)).toBe(false);
  });

  it("두 번 눌러도 한 번만 저장한다", async () => {
    const { result } = renderHook(() => useLab());
    await waitFor(() => expect(result.current.state).not.toBeNull());
    await act(() => result.current.run());
    await act(async () => {
      void result.current.save();
      await result.current.save();
    });
    expect((await api.saved()).length).toBe(4);
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it("저장이 거부되면 알리고 저장 버튼은 열려 있다", async () => {
    const { result } = renderHook(() => useLab());
    await waitFor(() => expect(result.current.state).not.toBeNull());
    await act(() => result.current.run());
    vi.spyOn(api, "save").mockRejectedValueOnce(new ApiError(403, "데모에서는 저장하지 않는다"));
    await act(() => result.current.save());
    expect(toast).toHaveBeenCalledWith("데모에서는 저장하지 않는다", { id: "saved" });
    expect(canSave(result.current.state!)).toBe(true);
    expect((await api.saved()).length).toBe(3);
  });

  it("어댑터가 거부하면 그 메시지를 오류로 든다", async () => {
    vi.spyOn(api, "run").mockRejectedValueOnce(new ApiError(404, "데모에는 없는 화면이다"));
    const { result } = renderHook(() => useLab());
    await waitFor(() => expect(result.current.state).not.toBeNull());
    await act(() => result.current.run());
    expect(result.current.state?.status).toBe("error");
    expect(result.current.state?.error).toBe("데모에는 없는 화면이다");
  });

  it("보통 오류는 실행 실패로 바꾼다", async () => {
    vi.spyOn(api, "run").mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useLab());
    await waitFor(() => expect(result.current.state).not.toBeNull());
    await act(() => result.current.run());
    expect(result.current.state?.error).toBe("실행 실패");
  });
});
