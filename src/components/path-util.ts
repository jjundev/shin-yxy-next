import type { PathSubject } from "@/demo/types";

/** 확인 기간이 지나 실제 길이 두 점 이상 있나. 빈 배열이나 한 점은 "아직" */
export function hasActual(actual: number[] | null | undefined): boolean {
  return actual !== null && actual !== undefined && actual.length > 1;
}

/** 확인 기간이 지난 대상의 마지막 실제 수익률. 아직이면 null */
export function lastActual(p: PathSubject): number | null {
  return hasActual(p.actual) ? p.actual[p.actual.length - 1] : null;
}
