const MINUS = "\u2212";
const NONE = "\u2014";

function signed(v: number, suffix: string): string {
  return (v >= 0 ? "+" : MINUS) + Math.abs(v * 100).toFixed(1) + suffix;
}

export function formatPct(v: number | null | undefined): string {
  return v == null ? NONE : signed(v, "%");
}

export function formatPp(v: number | null | undefined): string {
  return v == null ? NONE : signed(v, "%p");
}

/** 저장 시각(toISOString)을 그 자리의 달력 날짜로. slice(0,10) 은 UTC 날짜라
 *  KST 09시 이전에 저장하면 하루 전으로 보인다 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 원본 pE 매핑. 확인 기간을 사람 말로 */
const HORIZON_LABELS: Record<number, string> = {
  5: "1주", 10: "2주", 20: "1개월", 40: "2개월", 60: "3개월", 120: "6개월", 250: "1년",
};

export function horizonLabel(days: number): string {
  return HORIZON_LABELS[days] ?? `${days}거래일`;
}
