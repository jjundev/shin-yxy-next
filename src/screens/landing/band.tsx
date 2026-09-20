import type { CSSProperties } from "react";
import { lastActual } from "@/components/path-util";
import { landing } from "@/content/landing";
import type { PathSubject, RunResult } from "@/demo/types";
import { REMAIN_BODY } from "@/content/why";
import { formatPct } from "@/lib/format";
import { LandingSection } from "./section";

const t = landing.band;

/** 80% 범위 막대 하나. 공통 눈금 위에 low80~high80 을 놓고 예상과 실제를 찍는다 */
function RangeBar({ s, lo, hi, index }: { s: PathSubject; lo: number; hi: number; index: number }) {
  const at = (v: number) => `${(((v - lo) / (hi - lo)) * 100).toFixed(1)}%`;
  const actual = lastActual(s);
  return (
    <li className="rise flex flex-col gap-1.5" style={{ "--d": 0.15 * index } as CSSProperties}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{s.name}</span>
        <span className="num text-xs text-muted-foreground">
          {formatPct(s.low80)} ~ {formatPct(s.high80)}
        </span>
      </div>
      <div className="relative h-6 rounded-md bg-muted">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 rounded-md bg-chart-wash"
          style={{ left: at(s.low80), right: `calc(100% - ${at(s.high80)})` }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-1 w-0.5 bg-chart"
          style={{ left: at(s.center) }}
        />
        {actual !== null && (
          <span
            aria-hidden="true"
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
            style={{ left: at(actual) }}
          />
        )}
      </div>
    </li>
  );
}

/** S7. 3단계 설명의 3단계 — 남는다. 끝 날의 범위가 곧 업종 표의 80% 범위다 */
export function Band({ result }: { result: RunResult | null }) {
  const picked = result?.paths.subjects.filter((s) => s.round === 1 && s.selected) ?? [];
  let lo = 0;
  let hi = 0;
  for (const s of picked) {
    lo = Math.min(lo, s.low80);
    hi = Math.max(hi, s.high80);
  }
  if (hi - lo < 1e-9) hi = lo + 0.01;

  return (
    <LandingSection id="band" title={t.title} lead={REMAIN_BODY}>
      {picked.length > 0 && (
        <ul
          aria-label={t.legend}
          className="mx-auto flex w-full max-w-content flex-col gap-5 rounded-lg border bg-card p-6"
        >
          {picked.map((s, i) => (
            <RangeBar key={s.subjectId} s={s} lo={lo} hi={hi} index={i} />
          ))}
        </ul>
      )}
      <p className="mx-auto max-w-content text-sm break-keep text-muted-foreground">{t.foot}</p>
    </LandingSection>
  );
}
