import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import { api, isApiError } from "@/api/client";
import { strings } from "@/content/strings";
import type { LabConfig, LabModule, RoundKey, RunRequest, RunResult } from "@/demo/types";
import type { Focus } from "@/components/focus";

export type Status = "idle" | "running" | "error";
export type Layer = 1 | 2;
export type Mode = "actual" | "rolled";

export interface LabState {
  config: LabConfig;
  request: RunRequest;
  result: RunResult | null;
  /** result 를 만든 요청. request 와 다르면 dirty */
  ranRequest: RunRequest | null;
  status: Status;
  error: string | null;
  /** 저장한 결과 참조. result 와 같으면 저장 버튼이 잠긴다 */
  savedResult: RunResult | null;
  layer: Layer;
  mode: Mode;
  focus: Focus | null;
}

export type LabAction =
  | { type: "asOf"; value: string }
  | { type: "horizon"; value: number }
  | { type: "module"; keys: string[]; on: boolean }
  | { type: "run:start" }
  | { type: "run:ok"; request: RunRequest; result: RunResult }
  | { type: "run:fail"; message: string }
  | { type: "saved"; result: RunResult }
  | { type: "layer"; value: Layer }
  | { type: "mode"; value: Mode }
  | { type: "focus"; value: Focus | null };

const ROUND_OF_LETTER: Record<string, RoundKey> = { M: "0", S: "1", I: "2" };

/** 원본 nj: "MSI" 같은 문자열을 라운드 키 목록으로 */
export function roundsOf(module: LabModule): RoundKey[] {
  return [...module.rounds].map((ch) => ROUND_OF_LETTER[ch]).filter((r): r is RoundKey => r !== undefined);
}

/** 원본 ij: 이 모듈이 도는 라운드 중 켜진 수 */
export function moduleState(request: RunRequest, module: LabModule): { on: number; of: number } {
  const rounds = roundsOf(module);
  const on = rounds.filter((r) => request.rounds[r].modules[module.key]?.on ?? false).length;
  return { on, of: rounds.length };
}

export function initialLabState(config: LabConfig, request: RunRequest): LabState {
  return {
    config, request, result: null, ranRequest: null, status: "idle", error: null,
    savedResult: null, layer: 1, mode: "actual", focus: null,
  };
}

export function isDirty(s: LabState): boolean {
  return s.result !== null && JSON.stringify(s.request) !== JSON.stringify(s.ranRequest);
}

export function canSave(s: LabState): boolean {
  return s.result !== null && s.status === "idle" && s.savedResult !== s.result;
}

function setModules(request: RunRequest, config: LabConfig, keys: string[], on: boolean): RunRequest {
  const rounds = structuredClone(request.rounds);
  for (const key of keys) {
    const module = config.modules.find((m) => m.key === key);
    if (!module) continue;
    for (const r of roundsOf(module)) {
      const prev = rounds[r].modules[key] ?? { on: false, filter: false };
      rounds[r].modules[key] = { ...prev, on };
    }
  }
  return { ...request, rounds };
}

export function labReducer(s: LabState, a: LabAction): LabState {
  switch (a.type) {
    case "asOf":
      return { ...s, request: { ...s.request, asOf: a.value } };
    case "horizon":
      return { ...s, request: { ...s.request, horizonDays: a.value } };
    case "module":
      return { ...s, request: setModules(s.request, s.config, a.keys, a.on) };
    case "run:start":
      return { ...s, status: "running", error: null };
    case "run:ok": {
      const hasActual = a.result.paths.subjects.some((p) => p.actual.length > 1);
      return {
        ...s, status: "idle", error: null, result: a.result, ranRequest: a.request,
        focus: { round: 0, subjectId: a.result.market.subjectId },
        mode: hasActual ? "actual" : "rolled",
      };
    }
    case "run:fail":
      return { ...s, status: "error", error: a.message, result: null, ranRequest: null };
    case "saved":
      return { ...s, savedResult: a.result };
    case "layer": {
      /** 다른 층의 대상에 집중한 채로 층을 바꾸면 차트와 순위가 어긋난다. 시장으로 되돌린다 */
      const stale = s.focus !== null && s.focus.round !== 0 && s.focus.round !== a.value;
      const focus = stale ? { round: 0 as const, subjectId: s.result?.market.subjectId ?? 0 } : s.focus;
      return { ...s, layer: a.value, focus };
    }
    case "mode":
      return { ...s, mode: a.value };
    case "focus":
      return { ...s, focus: a.value };
  }
}

type Boot = { type: "init"; config: LabConfig; request: RunRequest };

function bootReducer(s: LabState | null, a: LabAction | Boot): LabState | null {
  if (a.type === "init") return initialLabState(a.config, a.request);
  return s === null ? null : labReducer(s, a);
}

export interface LabApi {
  /** 설정을 읽기 전엔 null */
  state: LabState | null;
  dispatch: (a: LabAction) => void;
  run: () => Promise<void>;
  save: () => Promise<void>;
}

export function useLab(): LabApi {
  const [state, dispatch] = useReducer(bootReducer, null);

  useEffect(() => {
    let alive = true;
    api.config().then((config) => {
      if (alive) dispatch({ type: "init", config, request: api.defaultRequest(config) });
    });
    return () => {
      alive = false;
    };
  }, []);

  const request = state?.request;
  const status = state?.status;
  const run = useCallback(async () => {
    if (!request || status === "running") return;
    const snapshot = structuredClone(request);
    dispatch({ type: "run:start" });
    try {
      const result = await api.run(snapshot);
      dispatch({ type: "run:ok", request: snapshot, result });
    } catch (e) {
      dispatch({ type: "run:fail", message: isApiError(e) ? e.message : strings.lab.runFailed });
    }
  }, [request, status]);

  /** 같은 결과가 두 번 저장되지 않게 하는 빗장 */
  const saving = useRef(false);
  const save = useCallback(async () => {
    if (!state || !canSave(state) || !state.ranRequest || !state.result) return;
    if (saving.current) return;
    saving.current = true;
    try {
      const saved = await api.save(state.ranRequest, state.result);
      toast(strings.lab.savedToast(saved.request.asOf), { id: "saved" });
      dispatch({ type: "saved", result: state.result });
    } catch (e) {
      toast(isApiError(e) ? e.message : strings.lab.saveFailed, { id: "saved" });
    } finally {
      saving.current = false;
    }
  }, [state]);

  return { state, dispatch, run, save };
}
