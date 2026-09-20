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

/** 원본 pE 매핑. 확인 기간을 사람 말로 */
const HORIZON_LABELS: Record<number, string> = {
  5: "1주", 10: "2주", 20: "1개월", 40: "2개월", 60: "3개월", 120: "6개월", 250: "1년",
};

export function horizonLabel(days: number): string {
  return HORIZON_LABELS[days] ?? `${days}거래일`;
}
