import { config, runLab } from "@/demo/generated/adapter";
import type { RunResult } from "@/demo/types";

let cached: RunResult | null = null;

/** 랜딩 테스트들이 같이 쓰는 고정 시드 결과 (상위 스펙 5.4).
 *  생성기는 입력에 대해 결정적이고 13ms 만에 끝난다. 테스트에서만 쓴다 */
export function fixedResult(): RunResult {
  cached ??= runLab({
    asOf: "2026-01-15",
    horizonDays: 20,
    regressWindow: config.regressWindow,
    bandMethod: config.bandMethod,
    rounds: structuredClone(config.defaults),
  });
  return cached;
}
