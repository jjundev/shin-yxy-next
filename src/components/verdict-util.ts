import { label } from "@/content/labels";
import { strings } from "@/content/strings";
import type { Contribution, Subject } from "@/demo/types";
import type { SubjectVerdict } from "@/demo/verdict";

const t = strings.lab.verdict;

export function tone(v: number | null): string | undefined {
  return v === null ? undefined : v >= 0 ? "text-up" : "text-down";
}

export const VERDICT_TONE: Record<SubjectVerdict, string> = {
  SUCCESS: "bg-accent text-accent-foreground",
  DIRECTION_ONLY: "border text-foreground",
  FAIL: "bg-muted text-muted-foreground",
  PENDING: "border text-muted-foreground",
};

export function pickState(s: Subject, isMarket: boolean): string {
  if (isMarket) return t.pick.base;
  if (s.selected) return label("뽑음");
  if (s.excludedStage === "BELOW_START") return t.pick.belowStart;
  if (s.excludedStage === "FILTER") return t.pick.filtered;
  return label("안 뽑음");
}

/** 방향을 민 재료 상위 셋. 원본 "무엇이 밀었나" */
export function topShifts(c: Contribution[]): Contribution[] {
  return c.filter((x) => x.branch === "SHIFT").sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 3);
}
