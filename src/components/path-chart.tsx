import { useEffect, useRef, useState, type RefObject } from "react";
import { scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import { strings } from "@/content/strings";
import type { PathSubject } from "@/demo/types";
import { formatPct } from "@/lib/format";
import { focusKey, sameFocus, type Focus } from "./focus";
import { hasActual } from "./path-util";

export interface PathChartProps {
  dates: string[];
  /** 이미 층으로 걸러진 대상들(시장 + 업종 11 또는 시장 + 1등 종목 11) */
  subjects: PathSubject[];
  focus: Focus | null;
  mode: "actual" | "rolled";
  height?: number;
}

const PAD = { top: 12, right: 12, bottom: 22, left: 48 };

function useWidth(ref: RefObject<HTMLDivElement | null>, fallback: number): number {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw) setW(cw);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

type Pt = [number, number];
const toPts = (ys: number[]): Pt[] => ys.map((y, i) => [i, y]);

export function PathChart({ dates, subjects, focus, mode, height = 280 }: PathChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useWidth(ref, 640);
  const n = dates.length;
  const focused = subjects.find((s) => sameFocus({ round: s.round, subjectId: s.subjectId }, focus)) ?? subjects[0];
  if (!focused || n < 2) return <div ref={ref} />;

  const drawn: number[][] = [focused.low, focused.high];
  if (mode === "actual") for (const s of subjects) drawn.push(hasActual(s.actual) ? s.actual : s.expected);
  else drawn.push(...focused.samples, hasActual(focused.actual) ? focused.actual : focused.expected);
  let lo = 0;
  let hi = 0;
  for (const ys of drawn) for (const v of ys) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  if (hi - lo < 1e-9) hi = lo + 0.01;

  const x = scaleLinear().domain([0, n - 1]).range([PAD.left, width - PAD.right]);
  const y = scaleLinear().domain([lo, hi]).nice().range([height - PAD.bottom, PAD.top]);
  const path = line<Pt>().x((d) => x(d[0])).y((d) => y(d[1]));
  const band = area<number>().x((_, i) => x(i)).y0((_, i) => y(focused.low[i])).y1((_, i) => y(focused.high[i]));
  const d = (ys: number[]) => path(toPts(ys)) ?? "";
  const key = (s: PathSubject) => focusKey({ round: s.round, subjectId: s.subjectId });
  const focusedActual = hasActual(focused.actual);

  return (
    <div ref={ref} className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={strings.lab.picks.chartLabel}>
        {y.ticks(4).map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} className="stroke-border" strokeDasharray={tick === 0 ? undefined : "2 4"} />
            <text x={PAD.left - 6} y={y(tick)} dy="0.35em" textAnchor="end" className="num fill-muted-foreground text-[10px]">{formatPct(tick)}</text>
          </g>
        ))}
        <text x={PAD.left} y={height - 6} className="num fill-muted-foreground text-[10px]">{dates[0]}</text>
        <text x={width - PAD.right} y={height - 6} textAnchor="end" className="num fill-muted-foreground text-[10px]">{dates[n - 1]}</text>
        <path data-kind="band" d={band(focused.low) ?? ""} className="fill-chart-wash" />
        {mode === "actual"
          ? subjects.filter((s) => s !== focused && hasActual(s.actual)).map((s) => (
              <path key={key(s)} data-kind="actual" data-subject={key(s)} d={d(s.actual)} fill="none" className="stroke-flat" strokeWidth={1} opacity={0.6} />
            ))
          : focused.samples.map((ys, i) => {
              const dropped = focused.fates[i] !== "KEPT";
              return <path key={i} data-kind={dropped ? "dropped" : "sample"} d={d(ys)} fill="none" className={dropped ? "stroke-flat" : "stroke-chart"} strokeWidth={1} opacity={dropped ? 0.5 : 0.25} strokeDasharray={dropped ? "3 3" : undefined} />;
            })}
        {focusedActual ? (
          <path data-kind="focus" data-subject={key(focused)} d={d(focused.actual)} fill="none" className="stroke-chart" strokeWidth={2.5} />
        ) : (
          <path data-kind="expected" data-subject={key(focused)} d={d(focused.expected)} fill="none" className="stroke-chart" strokeWidth={2} strokeDasharray="5 4" />
        )}
      </svg>
    </div>
  );
}
