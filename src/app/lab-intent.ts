import type { SavedExperiment } from "@/demo/saved";

/** 실험실에 "이렇게 열어라" 하고 건네는 한 칸. 저장 항목은 자기 주소가 없고(상위 스펙 8)
 *  새로고침이면 사라져야 하므로(3.5) 라우터 state 가 아니라 메모리다.
 *  useLab 이 location.key 마다 peek 하고, 부팅을 마친 뒤 clear 한다 (StrictMode 의 이중 effect 를 견딘다) */
export type LabIntent = { kind: "guide" } | { kind: "open"; saved: SavedExperiment };

let pending: LabIntent | null = null;

export function setLabIntent(intent: LabIntent): void {
  pending = intent;
}

export function peekLabIntent(): LabIntent | null {
  return pending;
}

export function clearLabIntent(): void {
  pending = null;
}
