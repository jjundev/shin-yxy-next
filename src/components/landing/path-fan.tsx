import { useRef, type CSSProperties } from "react";
import { scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import { hasActual } from "@/components/path-util";
import { SIMULATIONS } from "@/content/constants";
import type { PathSubject } from "@/demo/types";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { cn } from "@/lib/utils";

const W = 960;
const H = 380;
const PAD = { top: 16, right: 16, bottom: 24, left: 8 };

type Pt = [number, number];

interface PathFanProps {
  subject: PathSubject;
  /** 그림 한 줄 설명 */
  label: string;
  /** 카운터 옆에 붙는 이름 */
  counterLabel: string;
  /** 좁은 화면에서 줄이는 자리. 기본 24(데이터에 있는 전부) */
  maxPaths?: number;
  className?: string;
}

/** 굴림 팬. 스크롤 진행에 따라 경로가 그려지고 → 체 비율만큼 떨어지고 → 밴드만 남는다.
 *  고정 시드의 표본은 전부 통과했으므로 떨어지는 줄 수는 subject.acceptRate 를
 *  보이는 줄 수에 맞춘 비율이다 (4단계 설계 6.1). 무작위를 쓰지 않는다 — 시각 회귀가 흔들린다.
 *  카운터의 글자만 JS 가 쓴다. CSS 로는 숫자를 못 센다 */
export function PathFan({ subject, label, counterLabel, maxPaths = 24, className }: PathFanProps) {
  const ref = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useScrollProgress(ref, {
    onFrame: (p) => {
      const el = counter.current;
      if (!el) return;
      // 0.6 에서 이미 4,000 에 닿고 그 뒤로는 멈춘다
      const t = Math.min(1, p / 0.6);
      el.textContent = Math.round(t * t * (3 - 2 * t) * SIMULATIONS).toLocaleString("en-US");
    },
  });

  const shown = subject.samples.slice(0, maxPaths);
  const n = subject.expected.length;
  const actual = hasActual(subject.actual) ? subject.actual : null;

  let lo = 0;
  let hi = 0;
  for (const ys of [subject.low, subject.high, ...shown, actual ?? subject.expected]) {
    for (const v of ys) {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }
  if (hi - lo < 1e-9) hi = lo + 0.01;

  const x = scaleLinear().domain([0, n - 1]).range([PAD.left, W - PAD.right]);
  const y = scaleLinear().domain([lo, hi]).nice().range([H - PAD.bottom, PAD.top]);
  const toLine = line<Pt>().x((d) => x(d[0])).y((d) => y(d[1]));
  const d = (ys: number[]) => toLine(ys.map((v, i) => [i, v] as Pt)) ?? "";
  const band = area<number>()
    .x((_, i) => x(i))
    .y0((_, i) => y(subject.low[i]))
    .y1((_, i) => y(subject.high[i]));

  const dropFrom = shown.length - Math.round(shown.length * (1 - (subject.acceptRate ?? 1)));

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
        <path d={band(subject.low) ?? ""} className="fan-band fill-chart-wash" />
        {shown.map((ys, i) => {
          const kept = i < dropFrom;
          return (
            <path
              key={i}
              d={d(ys)}
              fill="none"
              strokeWidth={1.5}
              data-kind={kept ? "kept" : "dropped"}
              style={{ "--i": i } as CSSProperties}
              strokeDasharray={kept ? undefined : "4 4"}
              className={kept ? "fan-path stroke-chart" : "fan-dropped stroke-flat"}
            />
          );
        })}
        {actual && (
          <path d={d(actual)} fill="none" strokeWidth={2.5} className="fan-actual stroke-foreground" />
        )}
      </svg>
      <p className="flex items-baseline justify-center gap-2 pt-2">
        <span ref={counter} className="num text-3xl font-medium md:text-5xl">0</span>
        <span className="text-sm text-muted-foreground">{counterLabel}</span>
      </p>
    </div>
  );
}
