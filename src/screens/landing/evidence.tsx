import { useState } from "react";
import type { Focus } from "@/components/focus";
import { PathChart } from "@/components/path-chart";
import { RankList } from "@/components/rank-list";
import { SummaryLine } from "@/components/summary-line";
import { VerdictTable } from "@/components/verdict-table";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import type { RunResult } from "@/demo/types";
import { Button } from "@/design/ui/button";
import { horizonLabel } from "@/lib/format";
import { LandingSection } from "./section";

const t = landing.evidence;

interface EvidenceProps {
  result: RunResult | null;
  error: boolean;
  onRetry: () => void;
}

/** S8. 상위 스펙 6장의 "증거 카드". 실험실이 쓰는 순수 컴포넌트를 그대로 쓴다 —
 *  같은 입력이면 같은 숫자가 나온다는 것이 이 섹션의 주장이다 (상위 스펙 5.4) */
export function Evidence({ result, error, onRetry }: EvidenceProps) {
  const [focus, setFocus] = useState<Focus | null>(null);
  const subjects = result?.paths.subjects.filter((s) => s.round === 0 || s.round === 1) ?? [];

  return (
    <LandingSection id="evidence" title={t.title}>
      {error ? (
        <div className="mx-auto flex max-w-content flex-wrap items-center gap-3 rounded-lg border border-dashed p-4 text-sm">
          <span>{strings.lab.runFailed}</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {strings.lab.retry}
          </Button>
        </div>
      ) : (
        result && (
          <div className="flex flex-col gap-8 rounded-lg border bg-card p-6">
            <p className="num text-xs text-muted-foreground">
              {t.setup(result.asOf, horizonLabel(result.horizonDays))}
            </p>
            <SummaryLine result={result} />
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
              <PathChart
                dates={result.paths.dates}
                subjects={subjects}
                focus={focus}
                mode="actual"
              />
              <RankList subjects={subjects} focus={focus} onFocus={setFocus} />
            </div>
            <VerdictTable result={result} focus={focus} onFocus={setFocus} />
          </div>
        )
      )}
      <p className="mx-auto max-w-content text-sm break-keep text-muted-foreground">{t.foot}</p>
    </LandingSection>
  );
}
