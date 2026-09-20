/** start~end 사이 평일(월~금) 목록, ISO 날짜 문자열. 휴장일 달력은 없다(원본도 평일만 센다) */
export function weekdaysBetween(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  for (; d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** date 이하에서 가장 가까운 평일의 인덱스. 앞이면 0 */
export function nearestWeekdayIndex(days: string[], date: string): number {
  let idx = -1;
  for (let i = 0; i < days.length && days[i] <= date; i++) idx = i;
  return Math.max(0, idx);
}
