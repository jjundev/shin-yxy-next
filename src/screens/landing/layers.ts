import type { PathSubject, RunResult } from "@/demo/types";

/** 시장 → 뽑은 업종 하나 → 그 업종의 1등 종목.
 *  round 2 의 subjectId 는 업종 id 가 아니라 종목 id 다(고정 시드에서 1400 = KT&G).
 *  rows 를 거쳐 이어야 한다. 셋이 다 갖춰지지 않으면 빈 배열 */
export function stackLayers(
  result: RunResult,
  marketName: string,
): { name: string; subject: PathSubject }[] {
  const market = result.paths.subjects.find((s) => s.round === 0);
  const sector = result.paths.subjects.find((s) => s.round === 1 && s.selected);
  const row = sector ? result.rows.find((r) => r.sectorId === sector.subjectId) : undefined;
  const leader = row
    ? result.paths.subjects.find((s) => s.round === 2 && s.subjectId === row.instrumentId)
    : undefined;
  if (!market || !sector || !leader) return [];
  return [
    { name: marketName, subject: market },
    { name: sector.name, subject: sector },
    { name: leader.name, subject: leader },
  ];
}
