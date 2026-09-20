import type { PathSubject } from "@/demo/types";

/** 확인 기간이 지난 대상의 마지막 실제 수익률. 아직이면 null */
export function lastActual(p: PathSubject): number | null {
  return p.actual.length > 1 ? p.actual[p.actual.length - 1] : null;
}
