/** 차트와 순위가 가리키는 대상 하나 */
export interface Focus {
  round: 0 | 1 | 2;
  subjectId: number;
}

export function focusKey(f: Focus): string {
  return `${f.round}:${f.subjectId}`;
}

export function sameFocus(a: Focus | null, b: Focus | null): boolean {
  return a !== null && b !== null && a.round === b.round && a.subjectId === b.subjectId;
}
