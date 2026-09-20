import { topShifts, VERDICT_TONE } from "@/components/verdict-util";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import type { RunResult } from "@/demo/types";
import { subjectVerdict } from "@/demo/verdict";
import { formatPct, horizonLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LandingSection } from "./section";

const t = landing.honesty;

/** S9. 뽑았는데 방향이 틀린 업종 하나를 크게 건다.
 *  고정 시드에서는 의료다 — 예상 +2.59%, 실제 −0.27% (상위 스펙 5.4) */
export function Honesty({ result }: { result: RunResult | null }) {
  const wrong =
    result?.round1.estimates.find((s) => s.selected && subjectVerdict(s) === "FAIL") ?? null;
  const horizon = horizonLabel(result?.horizonDays ?? 20);

  return (
    <LandingSection id="honesty" title={t.title} lead={t.body}>
      {wrong && (
        <div
          role="group"
          aria-label={t.title}
          className="mx-auto flex w-full max-w-content flex-col gap-6 rounded-lg border bg-card p-8"
        >
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold">{wrong.name}</span>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium",
                VERDICT_TONE[subjectVerdict(wrong)],
              )}
            >
              {strings.subjectVerdict[subjectVerdict(wrong)]}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{t.predicted}</dt>
              <dd className="num text-3xl font-medium text-up">{formatPct(wrong.center)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">
                {horizon} {t.actual}
              </dt>
              <dd className="num text-3xl font-medium text-down">{formatPct(wrong.actual)}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2 border-t pt-4">
            <span className="text-xs text-muted-foreground">{t.pushed}</span>
            <ul className="flex flex-wrap gap-4 text-sm">
              {topShifts(wrong.contributions).map((c) => (
                <li key={c.moduleKey} className="flex items-baseline gap-2">
                  <span>{c.moduleName}</span>
                  <span className="num text-muted-foreground">{formatPct(c.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </LandingSection>
  );
}
