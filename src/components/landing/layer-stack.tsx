import type { CSSProperties } from "react";
import { scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import type { PathSubject } from "@/demo/types";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

const W = 420;
const H = 96;
const PAD = { top: 8, right: 8, bottom: 8, left: 8 };

type Pt = [number, number];

/** 층 하나에 들어가는 작은 경로 그림. 밴드와 예상선만 */
function Plane({ subject }: { subject: PathSubject }) {
  const n = subject.expected.length;
  let lo = 0;
  let hi = 0;
  for (const ys of [subject.low, subject.high, subject.expected]) {
    for (const v of ys) {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }
  if (hi - lo < 1e-9) hi = lo + 0.01;
  const x = scaleLinear().domain([0, n - 1]).range([PAD.left, W - PAD.right]);
  const y = scaleLinear().domain([lo, hi]).range([H - PAD.bottom, PAD.top]);
  const toLine = line<Pt>().x((d) => x(d[0])).y((d) => y(d[1]));
  const band = area<number>()
    .x((_, i) => x(i))
    .y0((_, i) => y(subject.low[i]))
    .y1((_, i) => y(subject.high[i]));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
      <path d={band(subject.low) ?? ""} className="fill-chart-wash" />
      <path
        d={toLine(subject.expected.map((v, i) => [i, v] as Pt)) ?? ""}
        fill="none"
        strokeWidth={1.75}
        className="stroke-chart"
      />
    </svg>
  );
}

interface LayerStackProps {
  /** 위에서 아래로. 시장 → 업종 → 1등 종목 */
  layers: { name: string; subject: PathSubject }[];
  /** 그림 전체를 한 줄로 설명한다. 장식이 아니라 내용이다 */
  label: string;
  /** 층 간격 px */
  gap?: number;
  /** 층 사이로 답이 떨어지는 점을 그린다 (S6 캐스케이드) */
  showDrops?: boolean;
  className?: string;
}

/** 시장 → 업종 → 1등 종목 세 평면이 Z축으로 겹친 그림.
 *  자기 진행값을 갖지 않는다 — 감싼 섹션의 --p 를 CSS 상속으로 읽는다.
 *  회전과 드러나는 순서는 landing.css 의 .stack-* 규칙이 한다 */
export function LayerStack({ layers, label, gap = 96, showDrops = false, className }: LayerStackProps) {
  const last = layers.length - 1;
  return (
    <div role="img" aria-label={label} className={cn("stack mx-auto w-full max-w-[560px]", className)}>
      <div className="stack-inner relative aspect-[4/3]" style={{ "--gap": `${gap}px` } as CSSProperties}>
        {layers.map((l, i) => (
          <div
            key={l.name}
            data-layer={l.name}
            style={{ "--z": last - i, "--o": i } as CSSProperties}
            className="stack-layer absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-lg border bg-card/75 p-3 shadow-sm backdrop-blur-sm"
          >
            <div className="flex items-baseline justify-between pb-1">
              <span className="text-xs font-medium">{l.name}</span>
              <span className="num text-[10px] text-muted-foreground">{formatPct(l.subject.center)}</span>
            </div>
            <Plane subject={l.subject} />
            {showDrops && i < last && (
              <span
                aria-hidden="true"
                style={{ "--o": i + 0.5 } as CSSProperties}
                className="stack-drop absolute -bottom-2 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
