import { hasActual } from "./path-util";

interface SparklineProps {
  expected: number[];
  low: number[];
  high: number[];
  actual?: number[];
  label: string;
}

/** 표의 예상 흐름 셀. 96×26 뷰박스, 음영은 low~high, 선은 expected, 굵은 선은 actual */
export function Sparkline({ expected, low, high, actual, label }: SparklineProps) {
  const n = expected.length;
  if (n < 2) return null;
  let lo = 0;
  let hi = 0;
  for (const v of [...low, ...high, ...(actual ?? [])]) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  if (hi - lo < 1e-9) hi = lo + 0.01;
  const x = (i: number) => (i * 94) / (n - 1) + 1;
  const y = (v: number) => 24 - ((v - lo) / (hi - lo)) * 22;
  const pt = (i: number, v: number) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`;
  const band = [...high.map((v, i) => pt(i, v)), ...low.map((v, i) => pt(i, v)).reverse()].join(" ");
  const up = expected[n - 1] >= 0;
  const act = actual && hasActual(actual) ? actual.map((v, i) => pt(i, v)).join(" ") : null;
  return (
    <svg viewBox="0 0 96 26" className="h-[26px] w-24" role="img" aria-label={label}>
      <polygon points={band} className={up ? "fill-up/15" : "fill-down/15"} />
      <line x1={1} y1={y(0)} x2={95} y2={y(0)} className="stroke-border" strokeWidth={1} />
      <polyline points={expected.map((v, i) => pt(i, v)).join(" ")} fill="none" strokeWidth={1.5} className={up ? "stroke-up" : "stroke-down"} />
      {act && <polyline points={act} fill="none" strokeWidth={1.6} className="stroke-foreground" />}
    </svg>
  );
}
