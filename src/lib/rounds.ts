import type { LabModule, RoundKey } from "@/demo/types";

const ROUND_OF_LETTER: Record<string, RoundKey> = { M: "0", S: "1", I: "2" };

/** 원본 nj: "MSI" 같은 문자열을 라운드 키 목록으로 */
export function roundsOf(module: Pick<LabModule, "rounds">): RoundKey[] {
  return [...module.rounds].map((ch) => ROUND_OF_LETTER[ch]).filter((r): r is RoundKey => r !== undefined);
}
