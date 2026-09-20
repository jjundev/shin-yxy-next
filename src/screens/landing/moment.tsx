import type { CSSProperties } from "react";
import { FIXED_HORIZON_DAYS } from "@/content/constants";
import { landing } from "@/content/landing";
import type { PathSubject, RunResult } from "@/demo/types";
import { horizonLabel } from "@/lib/format";
import { LandingSection } from "./section";

const t = landing.moment;

/** 시장의 예상 밴드와 실제. 커튼이 덮을 자리라 좌표만 맞추면 된다 */
function Track({ subject }: { subject: PathSubject }) {
  const n = subject.expected.length;
  let lo = 0;
  let hi = 0;
  for (const ys of [subject.low, subject.high, subject.actual.length > 0 ? subject.actual : subject.expected]) {
    for (const v of ys) {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }
  if (hi - lo < 1e-9) hi = lo + 0.01;
  const x = (i: number) => 24 + (i * 912) / (n - 1);
  const y = (v: number) => 176 - ((v - lo) / (hi - lo)) * 152;
  const at = (v: number, i: number) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`;
  const pts = (ys: number[]) => ys.map(at).join(" ");
  return (
    <svg viewBox="0 0 960 200" className="h-auto w-full" aria-hidden="true">
      <polygon
        points={[...subject.high.map(at), ...subject.low.map(at).reverse()].join(" ")}
        className="fill-chart-wash"
      />
      <polyline points={pts(subject.expected)} fill="none" strokeWidth={2} strokeDasharray="5 4" className="stroke-chart" />
      {subject.actual.length > 0 && (
        <polyline points={pts(subject.actual)} fill="none" strokeWidth={2.5} className="stroke-foreground" />
      )}
    </svg>
  );
}

/** S3. 기준일 뒤를 덮은 커튼이 스크롤과 함께 오른쪽으로 걷힌다 */
export function Moment({ result }: { result: RunResult | null }) {
  const market = result?.paths.subjects.find((s) => s.round === 0) ?? null;
  const dates = result?.paths.dates ?? [];

  return (
    <LandingSection
      id="moment"
      title={t.title}
      lead={t.lead}
      span="cover"
    >
      <div className="relative overflow-hidden rounded-lg border bg-card p-6">
        <div className="flex items-baseline justify-between pb-3 text-xs text-muted-foreground">
          <span className="pin num font-medium text-foreground">
            {t.pin} {dates[0] ?? ""}
          </span>
          {/* 아래 숫자 카드의 이름과 글자가 똑같으면 같은 말이 두 번 있는 꼴이라
              읽는 사람도 테스트도 어느 쪽인지 못 가린다. 여기는 실제 거리를 같이 적는다 */}
          <span className="num">{t.horizon} {horizonLabel(result?.horizonDays ?? FIXED_HORIZON_DAYS)}</span>
          <span className="num">
            {t.scored} {dates[dates.length - 1] ?? ""}
          </span>
        </div>
        {market && <Track subject={market} />}
        <div
          className="curtain absolute inset-y-0 right-0 left-[18%] flex items-center justify-center bg-muted/95"
          aria-hidden="true"
        >
          <span className="text-sm text-muted-foreground">{t.curtain}</span>
        </div>
      </div>
      <p className="mx-auto max-w-content text-sm break-keep text-muted-foreground">{t.revealed}</p>

      <dl className="grid grid-cols-3 gap-6">
        {t.stats.map((s, i) => (
          <div key={s.name} className="rise flex flex-col gap-1" style={{ "--d": 0.2 + i * 0.15 } as CSSProperties}>
            <dt className="text-xs break-keep text-muted-foreground">{s.name}</dt>
            <dd className="num text-3xl font-medium md:text-4xl">
              {s.value}
              <span className="pl-1 text-base font-normal text-muted-foreground">{s.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </LandingSection>
  );
}
