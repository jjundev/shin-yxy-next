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
  "굴린 길": `업종 하나의 앞날을 ${SIMULATIONS_LABEL}번 흔들어 본 가상의 길. 그중 남은 것으로 범위를 만든다.`,
  "뽑음": "계산이 고른 업종. 예상 범위와 확신이 높은 순으로 정원만큼 고른다.",
  "안 뽑음": "순위에 올랐지만 정원에 못 든 업종.",
  "판독": "기준 시점 전 며칠의 기사를 읽어 업종별 방향과 세기로 바꾼 것.",
  "재료": "계산에 들어가는 입력. 일정, 뉴스 판독, 비슷했던 날들.",
  "돈의 흐름": "수급과 변동성처럼 값이 아니라 흐름을 보는 재료 축.",
};
