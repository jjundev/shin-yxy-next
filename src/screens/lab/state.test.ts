import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { api } from "@/api/client";
import { clearLabIntent, peekLabIntent, setLabIntent } from "@/app/lab-intent";
import { setOnboarded } from "@/app/onboarded";
import { ApiError, getConfig, setRunDelay } from "@/demo/adapter";
import * as gen from "@/demo/generated/adapter";
import { listSaved, resetSaved } from "@/demo/saved";
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
  localStorage.clear();
  clearLabIntent();
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

  it("안내: 기준 시점·재료 펼침·계산·판정 표 순으로 넘어가고 끝나면 null", () => {
    let s = initialLabState(config, api.defaultRequest(config), true);
    expect(s.guide).toBe(1);
    s = labReducer(s, { type: "horizon", value: 5 });
    expect(s.guide).toBe(2);
    s = labReducer(s, { type: "expand", section: "news" });
    expect(s.guide).toBe(3);
    s = labReducer(s, { type: "run:start" });
    expect(s.guide).toBe(4);
    s = labReducer(s, { type: "verdict:seen" });
    expect(s.guide).toBeNull();
  });

  it("안내: 1단계에서 바로 계산하면 4단계, 건너뛰면 null, 일반 모드는 안 움직인다", () => {
    let s = initialLabState(config, api.defaultRequest(config), true);
    s = labReducer(s, { type: "run:start" });
    expect(s.guide).toBe(4);
    s = labReducer(s, { type: "guide:skip" });
    expect(s.guide).toBeNull();
    const plain = labReducer(fresh(), { type: "expand", section: "cycle" });
    expect(plain.guide).toBeNull();
  });

  it("open 은 요청·결과·저장 참조를 한 번에 놓아 dirty 도 아니고 저장도 잠긴다", () => {
    const saved = listSaved()[0];
    const s = labReducer(fresh(), { type: "open", request: saved.request, result: saved.result });
    expect(s.request).toEqual(saved.request);
    expect(s.ranRequest).toEqual(saved.request);
    expect(s.result).toBe(saved.result);
    expect(s.savedResult).toBe(saved.result);
    expect(s.viewingSaved).toBe(true);
    expect(s.status).toBe("idle");
    expect(isDirty(s)).toBe(false);
    expect(canSave(s)).toBe(false);
    expect(s.focus).toEqual({ round: 0, subjectId: saved.result.market.subjectId });
    expect(s.mode).toBe("actual");
  });

  it("보던 저장 실험은 다시 계산하면 일반 상태로 돌아온다", () => {
    const saved = listSaved()[0];
    let s = labReducer(fresh(), { type: "open", request: saved.request, result: saved.result });
    s = labReducer(s, { type: "run:start" });
    expect(s.viewingSaved).toBe(true); // 계산 중에도 표시는 남는다
    s = labReducer(s, { type: "run:ok", request: saved.request, result: gen.runLab(saved.request) });
    expect(s.viewingSaved).toBe(false);
    expect(canSave(s)).toBe(true);
  });
});

describe("useLab", () => {
  beforeEach(() => {
    setOnboarded(); // 기존 테스트는 안내가 끝난 일반 모드를 가정한다
  });

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

  it("플래그가 없으면 안내로 열리고, 건너뛰면 플래그가 박힌다", async () => {
    localStorage.clear();
    const { result } = renderHook(() => useLab());
    await waitFor(() => expect(result.current.state).not.toBeNull());
    expect(result.current.state?.guide).toBe(1);
    act(() => result.current.skipGuide());
    expect(result.current.state?.guide).toBeNull();
    expect(localStorage.getItem("shin.onboarded")).toBe("1");
  });

  it("판정 표를 보면 안내가 끝나고 플래그가 박힌다", async () => {
    localStorage.clear();
    const { result } = renderHook(() => useLab());
    await waitFor(() => expect(result.current.state).not.toBeNull());
    await act(() => result.current.run());
    expect(result.current.state?.guide).toBe(4);
    act(() => result.current.seeVerdict());
    expect(result.current.state?.guide).toBeNull();
    expect(localStorage.getItem("shin.onboarded")).toBe("1");
  });

  it("열기 의도가 있으면 그 실험으로 열리고 의도는 지워진다. 안내는 안 뜬다", async () => {
    localStorage.clear();
    const saved = listSaved()[0];
    setLabIntent({ kind: "open", saved });
    const { result } = renderHook(() => useLab("k1"));
    // state 가 null 이면 ?. 가 undefined 로 빠져 result 단언이 헛돈다. 부팅부터 기다린다
    await waitFor(() => expect(result.current.state).not.toBeNull());
    expect(result.current.state?.result).not.toBeNull();
    expect(result.current.state?.request.asOf).toBe("2025-10-15");
    expect(result.current.state?.viewingSaved).toBe(true);
    expect(result.current.state?.guide).toBeNull();
    expect(peekLabIntent()).toBeNull();
  });

  it("안내 의도로 같은 화면에 다시 들어오면 고정 입력으로 리셋되고 1단계", async () => {
    const { result, rerender } = renderHook(({ key }) => useLab(key), { initialProps: { key: "k1" } });
    await waitFor(() => expect(result.current.state).not.toBeNull());
    await act(() => result.current.run());
    expect(result.current.state?.result).not.toBeNull();
    // 의도 없이 key 만 바뀌면 그대로. 다시 부팅했다면 result 가 딴 객체가 된다
    const ran = result.current.state?.result;
    rerender({ key: "k2" });
    await act(async () => {});
    expect(result.current.state?.result).toBe(ran);
    setLabIntent({ kind: "guide" });
    rerender({ key: "k3" });
    await waitFor(() => expect(result.current.state?.guide).toBe(1));
    expect(result.current.state?.result).toBeNull();
    expect(result.current.state?.request.asOf).toBe("2026-01-15");
    expect(peekLabIntent()).toBeNull();
  });
});
