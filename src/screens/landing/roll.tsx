import { PathFan } from "@/components/landing/path-fan";
import { landing } from "@/content/landing";
import type { RunResult } from "@/demo/types";
import { LandingSection } from "./section";

const t = landing.roll;

/** S5. 3단계 설명의 2단계 — 굴린다.
 *  리드는 landing.roll.lead 다. strings 를 import 하지 않는다(noUnusedLocals).
 *  떨어지는 줄 수는 acceptRate 를 보이는 줄 수에 맞춘 비율이고, 그것을 accept 문장이 밝힌다 */
export function Roll({ result }: { result: RunResult | null }) {
  const subject = result?.paths.subjects.find((s) => s.round === 1 && s.selected) ?? null;
  const shown = subject ? subject.samples.length : 0;
  const rate = subject?.acceptRate ?? 1;
  const dropped = Math.round(shown * (1 - rate));

  return (
    <LandingSection id="roll" title={t.title} lead={t.lead} scrub>
      {subject && (
        <>
          <PathFan subject={subject} label={t.title} counterLabel={t.counterLabel} />
          <div className="mx-auto flex max-w-content flex-col gap-2 text-sm text-muted-foreground">
            <p className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <i aria-hidden="true" className="inline-block h-0.5 w-6 bg-chart" />
                {t.keptLabel}
              </span>
              <span className="flex items-center gap-2">
                <i aria-hidden="true" className="inline-block h-0.5 w-6 bg-flat" />
                {t.droppedLabel}
              </span>
            </p>
            <p className="break-keep">{t.honest}</p>
            <p className="break-keep">{t.accept(`${Math.round(rate * 100)}%`, dropped, shown)}</p>
          </div>
        </>
      )}
    </LandingSection>
  );
}
