import { useRef } from "react";
import { useLocation } from "react-router";
import { SummaryLine } from "@/components/summary-line";
import { VerdictTable } from "@/components/verdict-table";
import { strings } from "@/content/strings";
import { Skeleton } from "@/design/ui/skeleton";
import { useInView } from "@/lib/use-in-view";
import { Checklist } from "./checklist";
import { GUIDE_STEPS } from "./guide";
import { GuideCard } from "./guide-card";
import { Ingredients } from "./ingredients";
import { Picks } from "./picks";
import { LabRail } from "./rail";
import { ResultSection } from "./section";
import { canSave, isDirty, useLab } from "./state";
import { WhenSection } from "./when";
import { WhyCalc, WhyPicks, WhySheet, WhyVerdict } from "./why-sheet";

function Booting() {
  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]" role="status" aria-label={strings.lab.loading}>
      <Skeleton className="h-64" />
      <Skeleton className="h-24" />
    </div>
  );
}

export function LabScreen() {
  const location = useLocation();
  const { state, dispatch, run, save, skipGuide, seeVerdict } = useLab(location.key);
  const verdictRef = useRef<HTMLDivElement>(null);
  useInView(verdictRef, state?.guide === 4, seeVerdict);
  if (!state) return <Booting />;
  const { config, request, result, status, error, guide } = state;
  const t = strings.lab;
  const spec = guide === null ? null : GUIDE_STEPS[guide - 1];
  /** 안내 1~3단계는 결과 영역에 카드만 (상위 스펙 5.1) */
  const cardOnly = guide !== null && guide < 4;
  const empty = result === null && status === "idle";
  const samples = result?.paths.subjects.find((s) => s.round === 1)?.samples.length ?? 0;

  return (
    <div className="grid gap-6 md:grid-cols-[320px_minmax(0,1fr)]">
      <LabRail
        checklist={guide !== null && <Checklist step={guide} onSkip={skipGuide} />}
        dim={spec?.dim}
        openIngredients={guide === 2}
        when={
          <WhenSection
            config={config}
            request={request}
            status={status}
            hasResult={result !== null}
            dirty={isDirty(state)}
            canSave={canSave(state)}
            saved={result !== null && state.savedResult === result}
            viewingSaved={state.viewingSaved}
            onAsOf={(value) => dispatch({ type: "asOf", value })}
            onHorizon={(value) => dispatch({ type: "horizon", value })}
            onRun={run}
            onSave={save}
          />
        }
        ingredients={
          <Ingredients
            config={config}
            request={request}
            onModules={(keys, on) => dispatch({ type: "module", keys, on })}
            onExpand={(section) => dispatch({ type: "expand", section })}
          />
        }
      />
      <div className="flex min-w-0 flex-col gap-8">
        {guide !== null && <GuideCard step={guide} config={config} request={request} result={result} />}
        {cardOnly ? null : empty ? (
          <section className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">{t.emptyResult}</section>
        ) : (
          <>
            <ResultSection
              title={t.summary.title}
              status={status}
              error={error}
              onRetry={run}
              why={
                <WhySheet title={t.summary.title} description={t.whyDescription.summary}>
                  <WhyCalc config={config} request={request} result={result} />
                </WhySheet>
              }
            >
              {result && <SummaryLine result={result} />}
            </ResultSection>
            <ResultSection
              title={t.picks.title}
              status={status}
              error={error}
              onRetry={run}
              why={
                <WhySheet title={t.picks.title} description={t.whyDescription.picks}>
                  <WhyPicks samples={samples} />
                </WhySheet>
              }
            >
              {result && (
                <Picks
                  result={result}
                  layer={state.layer}
                  mode={state.mode}
                  focus={state.focus}
                  onLayer={(value) => dispatch({ type: "layer", value })}
                  onMode={(value) => dispatch({ type: "mode", value })}
                  onFocus={(value) => dispatch({ type: "focus", value })}
                />
              )}
            </ResultSection>
            <div ref={verdictRef}>
              <ResultSection
                title={t.verdict.title}
                status={status}
                error={error}
                onRetry={run}
                why={
                  <WhySheet title={t.verdict.title} description={t.whyDescription.verdict}>
                    <WhyVerdict asOf={request.asOf} />
                  </WhySheet>
                }
              >
                {result && <VerdictTable result={result} />}
              </ResultSection>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
