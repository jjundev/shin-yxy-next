import type { RunResult, Subject } from "./types";

export type ExperimentVerdict = "SUCCESS" | "FAIL" | "PENDING";
export type SubjectVerdict = "SUCCESS" | "DIRECTION_ONLY" | "FAIL" | "PENDING";

type ReturnPair = Pick<RunResult, "avgReturn" | "benchReturn">;
type Scored = Pick<Subject, "center" | "low80" | "high80" | "actual">;

/** 평균 수익률에서 시장 수익률을 뺀 값. 원본 요약 문장의 "시장보다 +x%p" */
export function excessReturn(r: ReturnPair): number | null {
  if (r.avgReturn === null || r.benchReturn === null) return null;
  return r.avgReturn - r.benchReturn;
}

/** 원본 규칙: 확인 기간이 다 지났고 초과 수익이 0 이상이면 예상 성공 */
export function experimentVerdict(
  r: ReturnPair & Pick<RunResult, "horizonReached">,
): ExperimentVerdict {
  if (!r.horizonReached) return "PENDING";
  const x = excessReturn(r);
  if (x === null) return "PENDING";
  return x >= 0 ? "SUCCESS" : "FAIL";
}

export function directionHit(center: number, actual: number | null): boolean | null {
  if (actual == null) return null;
  return center >= 0 === actual >= 0;
}

export function inRange(
  s: Pick<Subject, "low80" | "high80">,
  actual: number | null,
): boolean | null {
  if (actual == null) return null;
  return actual >= s.low80 && actual <= s.high80;
}

/** 원본 규칙: 방향 맞고 범위 안이면 성공, 방향만 맞으면 방향만 맞음, 틀리면 실패 */
export function subjectVerdict(s: Scored): SubjectVerdict {
  const dir = directionHit(s.center, s.actual);
  if (dir === null) return "PENDING";
  if (dir && inRange(s, s.actual) !== false) return "SUCCESS";
  if (dir) return "DIRECTION_ONLY";
  return "FAIL";
}

/** 뽑은 대상 중 방향이 맞은 수. 업종 층(round1.estimates)을 넘겨 쓴다 */
export function selectedHits(estimates: Subject[]): { hits: number; total: number } {
  const picked = estimates.filter((s) => s.selected);
  const hits = picked.filter((s) => directionHit(s.center, s.actual) === true).length;
  return { hits, total: picked.length };
}
