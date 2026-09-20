import type { Term } from "@/content/labels";

export type GuideStep = 1 | 2 | 3 | 4;
export const GUIDE_LAST: GuideStep = 4;

/** 어느 "왜?" 시트를 여나 (설계 결정 17) */
export type WhyKey = "summary" | "verdict";

export interface GuideSpec {
  /** 이 단계 카드에서 처음 나오는 용어. TERM_GLOSSARY 로 한 줄씩 푼다 (상위 스펙 3.4) */
  terms: Term[];
  why: WhyKey;
  /** 지금 단계가 아닌 레일 섹션은 흐리다 (상위 스펙 5.1). 막지는 않는다 (5.3) */
  dim: { when?: boolean; ingredients?: boolean };
}

/** 문구는 strings.lab.guide.steps[i] 와 같은 순서 */
export const GUIDE_STEPS: readonly GuideSpec[] = [
  { terms: [], why: "verdict", dim: { ingredients: true } },
  { terms: ["재료", "판독", "돈의 흐름"], why: "summary", dim: { when: true } },
  { terms: ["굴린 길"], why: "summary", dim: { ingredients: true } },
  { terms: ["뽑음", "안 뽑음"], why: "verdict", dim: {} },
];

/** 상위 스펙 5.3: reached 단계의 완료 조건을 채웠다. 지금 단계가 그보다 앞이면(순서 이탈 포함)
 *  reached 까지 완료로 치고 다음으로 간다. 4를 채우면 안내가 끝난다(null). 뒤 단계 조건이면 그대로 */
export function advanceGuide(guide: GuideStep | null, reached: GuideStep): GuideStep | null {
  if (guide === null || guide > reached) return guide;
  return reached === GUIDE_LAST ? null : ((reached + 1) as GuideStep);
}
