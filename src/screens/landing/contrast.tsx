import type { CSSProperties } from "react";
import { AssetSlot } from "@/components/landing/asset-slot";
import { VERDICT_TONE } from "@/components/verdict-util";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import type { RunResult } from "@/demo/types";
import { subjectVerdict } from "@/demo/verdict";
import { formatPct, horizonLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LandingSection } from "./section";

const t = landing.contrast;
const c = strings.lab.verdict.columns;

/** S2. 왼쪽은 가상의 예측 앱, 오른쪽은 같은 자리에 판정이 붙은 이 도구 */
export function Contrast({ result }: { result: RunResult | null }) {
  const picked = result?.round1.estimates.filter((s) => s.selected) ?? [];
  const horizon = horizonLabel(result?.horizonDays ?? 20);

  return (
    <LandingSection id="contrast" title={t.title} lead={t.body}>
      <div className="grid gap-8 md:grid-cols-2">
        <figure className="rise flex flex-col gap-3" style={{ "--d": 0.1 } as CSSProperties}>
          <figcaption className="text-sm font-medium">{t.theirs}</figcaption>
          {/* 남의 화면을 인용한 틀. 그림 캔버스가 불투명 흰색(#fdfdfd, 평균 휘도 0.881)이라
              다크에서 밝게 뜬다. 테두리와 여백으로 감싸 두면 사고가 아니라 의도로 읽히고,
              남의 화면이 이질적으로 밝은 것이 오히려 대조를 강화한다 (검수 결정) */}
          <div className="rounded-xl border bg-muted/40 p-3 shadow-sm dark:bg-muted/20">
            <AssetSlot
              id="contrast-forecast-app"
              alt={t.imageAlt}
              ratio="4/3"
              className="-rotate-1 shadow-md dark:opacity-85"
            />
          </div>
          <p className="text-sm break-keep text-muted-foreground">{t.theirsFoot}</p>
        </figure>

        <figure className="rise flex flex-col gap-3" style={{ "--d": 0.35 } as CSSProperties}>
          <figcaption className="text-sm font-medium">{t.ours}</figcaption>
          {/* 머리글 줄은 ul 밖에 둔다. 안에 넣으면 li 가 되어 "뽑은 업종 셋" 이라는
              목록의 뜻이 흐려진다 (목록 항목이 넷이 된다) */}
          <div className="flex flex-col rounded-lg border bg-card">
            <div className="flex items-center gap-3 border-b px-4 py-2 text-xs text-muted-foreground">
              <span className="flex-1" />
              <span className="w-16 text-right">{c.expected}</span>
              <span className="w-16 text-right">{c.actual(horizon)}</span>
              <span className="w-20" />
            </div>
            <ul aria-label={t.ours} className="flex flex-col divide-y">
              {picked.map((s) => {
                const v = subjectVerdict(s);
                return (
                  <li key={s.subjectId} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="num w-16 text-right text-muted-foreground">{formatPct(s.center)}</span>
                    <span className="num w-16 text-right">{formatPct(s.actual)}</span>
                    <span
                      className={cn(
                        "w-20 rounded-md px-2 py-0.5 text-center text-xs font-medium whitespace-nowrap",
                        VERDICT_TONE[v],
                      )}
                    >
                      {strings.subjectVerdict[v]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="text-sm break-keep text-muted-foreground">{t.oursFoot}</p>
        </figure>
      </div>
    </LandingSection>
  );
}
