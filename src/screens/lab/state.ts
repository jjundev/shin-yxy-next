import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import { api, isApiError } from "@/api/client";
import { clearLabIntent, peekLabIntent } from "@/app/lab-intent";
import { isOnboarded, setOnboarded } from "@/app/onboarded";
import { hasActual } from "@/components/path-util";
import type { Focus } from "@/components/focus";
import { strings } from "@/content/strings";
import type { LabConfig, LabModule, RunRequest, RunResult } from "@/demo/types";
import { roundsOf } from "@/lib/rounds";
import { advanceGuide, type GuideStep } from "./guide";

export { roundsOf };

export type Status = "idle" | "running" | "error";
export type Layer = 1 | 2;
export type Mode = "actual" | "rolled";
/** 레일 "무엇으로"의 세 재료 섹션 */
export type IngredientKey = "cycle" | "news" | "impact";

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
  /** 안내 모드의 지금 단계. null 이면 일반 모드 (상위 스펙 5장) */
  guide: GuideStep | null;
  /** 저장소에서 연 실험을 다시 계산하지 않고 보는 중 (상위 스펙 4.4) */
  viewingSaved: boolean;
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
  | { type: "focus"; value: Focus | null }
  /** 재료 섹션 "자세히"를 펼쳤다. 안내 2단계 완료 조건 */
  | { type: "expand"; section: IngredientKey }
  /** 판정 표가 화면에 들어왔다. 안내 4단계 완료 조건 */
  | { type: "verdict:seen" }
  | { type: "guide:skip" }
  | { type: "guide:next" }
  | { type: "open"; request: RunRequest; result: RunResult };

/** 원본 ij: 이 모듈이 도는 라운드 중 켜진 수 */
export function moduleState(request: RunRequest, module: LabModule): { on: number; of: number } {
  const rounds = roundsOf(module);
  const on = rounds.filter((r) => request.rounds[r].modules[module.key]?.on ?? false).length;
  return { on, of: rounds.length };
}

export function initialLabState(config: LabConfig, request: RunRequest, guided = false): LabState {
  return {
    config, request, result: null, ranRequest: null, status: "idle", error: null,
    savedResult: null, layer: 1, mode: "actual", focus: null,
    guide: guided ? 1 : null, viewingSaved: false,
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

/** 결과가 생겼을 때 공통: 시장에 집중, 실제 움직임이 있으면 그 모드 */
function withResult(s: LabState, request: RunRequest, result: RunResult): LabState {
  const actual = result.paths.subjects.some((p) => hasActual(p.actual));
  return {
    ...s, status: "idle", error: null, result, ranRequest: request,
    focus: { round: 0, subjectId: result.market.subjectId },
    mode: actual ? "actual" : "rolled",
    viewingSaved: false,
  };
}

export function labReducer(s: LabState, a: LabAction): LabState {
  switch (a.type) {
    case "asOf":
      return { ...s, request: { ...s.request, asOf: a.value }, viewingSaved: false, guide: advanceGuide(s.guide, 1) };
    case "horizon":
      return { ...s, request: { ...s.request, horizonDays: a.value }, viewingSaved: false, guide: advanceGuide(s.guide, 1) };
    case "module":
      return { ...s, request: setModules(s.request, s.config, a.keys, a.on), viewingSaved: false };
    case "expand":
      return { ...s, guide: advanceGuide(s.guide, 2) };
    case "run:start":
      return { ...s, status: "running", error: null };
    case "run:ok":
      return withResult(s, a.request, a.result);
    case "run:fail":
      return { ...s, status: "error", error: a.message, result: null, ranRequest: null, viewingSaved: false };
    case "open":
      return { ...withResult(s, a.request, a.result), request: a.request, savedResult: a.result, viewingSaved: true, guide: null };
    case "saved":
      return { ...s, savedResult: a.result };
    case "verdict:seen":
      return { ...s, guide: advanceGuide(s.guide, 4) };
    case "guide:skip":
      return { ...s, guide: null };
    case "guide:next":
      return { ...s, guide: advanceGuide(s.guide, 3) };
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

type Boot = {
  type: "init";
  config: LabConfig;
  request: RunRequest;
  guided: boolean;
  open?: { request: RunRequest; result: RunResult };
};

function bootReducer(s: LabState | null, a: LabAction | Boot): LabState | null {
  if (a.type === "init") {
    const base = initialLabState(a.config, a.request, a.guided);
    return a.open ? labReducer(base, { type: "open", ...a.open }) : base;
  }
  return s === null ? null : labReducer(s, a);
}

export interface LabApi {
  /** 설정을 읽기 전엔 null */
  state: LabState | null;
  dispatch: (a: LabAction) => void;
  run: () => Promise<void>;
  save: () => Promise<void>;
  skipGuide: () => void;
  seeVerdict: () => void;
}

/** locationKey 가 바뀔 때마다 진입 의도(lab-intent)를 본다. 부팅 전이거나 의도가 있을 때만 다시 부팅한다.
 *  의도 없이 key 만 바뀌면(같은 경로 재클릭) 상태를 지킨다 */
export function useLab(locationKey?: string): LabApi {
  const [state, dispatch] = useReducer(bootReducer, null);
  const booted = useRef(false);

  useEffect(() => {
    let alive = true;
    const intent = peekLabIntent();
    if (booted.current && intent === null) return;
    api.config().then((config) => {
      if (!alive) return;
      const request = api.defaultRequest(config);
      if (intent?.kind === "open") {
        dispatch({ type: "init", config, request, guided: false, open: { request: intent.saved.request, result: intent.saved.result } });
      } else {
        dispatch({ type: "init", config, request, guided: intent?.kind === "guide" || !isOnboarded() });
      }
      booted.current = true;
      clearLabIntent();
    });
    return () => {
      alive = false;
    };
  }, [locationKey]);

  /** 안내가 숫자에서 null 로 바뀌는 순간(건너뛰기든 판정 표를 봤든) 플래그를 박는다 (상위 스펙 5.3) */
  const guide = state?.guide;
  const prevGuide = useRef<GuideStep | null | undefined>(undefined);
  useEffect(() => {
    if (prevGuide.current != null && guide === null) setOnboarded();
    prevGuide.current = guide;
  }, [guide]);

  const request = state?.request;
  const viewingSaved = state?.viewingSaved;

  const latestSeq = useRef(0);
  const runWithRequest = useCallback(async (req: RunRequest) => {
    const seq = ++latestSeq.current;
    const snapshot = structuredClone(req);
    dispatch({ type: "run:start" });
    try {
      const res = await api.run(snapshot);
      if (seq === latestSeq.current) {
        dispatch({ type: "run:ok", request: snapshot, result: res });
      }
    } catch (e) {
      if (seq === latestSeq.current) {
        dispatch({ type: "run:fail", message: isApiError(e) ? e.message : strings.lab.runFailed });
      }
    }
  }, []);

  const reqKey = request ? JSON.stringify(request) : null;
  const lastRanReq = useRef<string | null>(null);

  const run = useCallback(async () => {
    if (!request) return;
    lastRanReq.current = reqKey;
    await runWithRequest(request);
  }, [request, reqKey, runWithRequest]);

  useEffect(() => {
    if (!request || viewingSaved) return;
    if (lastRanReq.current === reqKey) return;

    const delay = lastRanReq.current === null ? 0 : 250;
    const timer = setTimeout(() => {
      lastRanReq.current = reqKey;
      runWithRequest(request);
    }, delay);

    return () => clearTimeout(timer);
  }, [reqKey, viewingSaved, request, runWithRequest]);

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

  const skipGuide = useCallback(() => dispatch({ type: "guide:skip" }), []);
  const seeVerdict = useCallback(() => dispatch({ type: "verdict:seen" }), []);

  return { state, dispatch, run, save, skipGuide, seeVerdict };
}
