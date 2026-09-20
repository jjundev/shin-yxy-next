import { SIMULATIONS_LABEL } from "./constants";

/** 스펙 3.4. 원본 목소리는 제목과 서술에서 쓰고, UI 라벨은 이 표로 바꾼다. */
export const TERM_LABELS = {
  "굴린 길": "시뮬레이션 경로",
  "뽑음": "선정",
  "안 뽑음": "미선정",
  "판독": "뉴스 판독",
  "재료": "입력 재료",
  "돈의 흐름": "자금 흐름",
} as const;

export type Term = keyof typeof TERM_LABELS;

export function label(term: Term): string {
  return TERM_LABELS[term];
}

/** 안내 모드에서 처음 나올 때 한 줄씩 풀어 주는 말 */
export const TERM_GLOSSARY: Record<Term, string> = {
  "굴린 길": `업종 하나의 앞날을 ${SIMULATIONS_LABEL}번 시뮬레이션해 본 가상 경로예요. 남은 경로들로 신뢰 범위를 계산해요.`,
  "뽑음": "알고리즘이 선정한 업종이에요. 예상 수익률과 확신도가 높은 순으로 정원만큼 골라요.",
  "안 뽑음": "순위에는 올랐지만 최종 정원에 들지 못한 업종이에요.",
  "판독": "기준 시점 전 며칠 동안의 뉴스를 분석해 업종별 영향 방향과 강도로 변환한 정보예요.",
  "재료": "예측 계산에 들어가는 입력 데이터예요. 일정, 뉴스 분석, 유사 국면이 포함돼요.",
  "돈의 흐름": "수급과 변동성처럼 가격 자체가 아닌 자금의 흐름을 반영하는 재료예요.",
};
