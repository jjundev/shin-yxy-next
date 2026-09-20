import { useRef } from "react";
import { useLocation } from "react-router";
import { SummaryLine } from "@/components/summary-line";
import { VerdictTable } from "@/components/verdict-table";
import { strings } from "@/content/strings";
import { Skeleton } from "@/design/ui/skeleton";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";
import { Checklist } from "./checklist";
import { GUIDE_STEPS } from "./guide";
import { GuideCard } from "./guide-card";
import { Ingredients } from "./ingredients";
import { Picks } from "./picks";
import { LabInspector } from "./inspector";
import { PanelRightOpen } from "lucide-react";
import { LabRail } from "./rail";
import { ResultSection } from "./section";
import { canSave, isDirty, useLab } from "./state";
import { WhenSection } from "./when";
import { WhyCalc, WhyPicks, WhySheet, WhyVerdict } from "./why-sheet";
import { useResizableDrawer } from "@/hooks/use-resizable-drawer";
import { DrawerTrigger, ResizeHandle } from "@/design/ui/resizable-drawer";
import { TooltipProvider } from "@/design/ui/tooltip";

function Booting() {
  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr] wide:grid-cols-[280px_1fr_340px]" role="status" aria-label={strings.lab.loading}>
      <Skeleton className="h-64" />
      <Skeleton className="h-24" />
      <Skeleton className="hidden h-64 wide:block" />
    </div>
  );
}

export function LabScreen() {
  const location = useLocation();
  const { state, dispatch, run, save, skipGuide, seeVerdict } = useLab(location.key);
  const verdictRef = useRef<HTMLDivElement>(null);
  const leftDrawer = useResizableDrawer({
    direction: "left",
    defaultWidth: 320,
    minWidth: 260,
    maxWidth: 480,
    storageKeyWidth: "shin.lab.rail-width",
    storageKeyCollapsed: "shin.lab.rail-collapsed",
  });
  const rightDrawer = useResizableDrawer({
    direction: "right",
    defaultWidth: 340,
    minWidth: 280,
    maxWidth: 500,
    storageKeyWidth: "shin.lab.right-drawer-width",
    storageKeyCollapsed: "shin.lab.right-drawer-collapsed",
    defaultCollapsed: () => (typeof window !== "undefined" ? window.innerWidth < 1400 : false),
  });
  /** 관찰은 판정 표가 실제로 그려진 뒤에만. 뼈대(running)나 오류 한 줄은 키 큰 화면에서
   *  이미 20% 보이므로, 계산하기를 누른 순간 안내가 끝나 버린다.
   *  섹션 머리가 아니라 표의 마지막 줄을 본다 — 키 큰 화면(1280x1600)에서는 결과가 닿자마자
   *  섹션 위쪽 20% 가 이미 보여서 "판정 표까지" 스크롤한 적이 없어도 단계가 끝난다 */
  useInView(
    verdictRef,
    state !== null && state.guide === 4 && state.result !== null && state.status === "idle",
    seeVerdict,
    { threshold: 0.9, select: (root) => root.querySelector('[data-slot="verdict-footer"]') },
  );
  if (!state) return <Booting />;
  const { config, request, result, status, error, guide } = state;
  const t = strings.lab;
  const spec = guide === null ? null : GUIDE_STEPS[guide - 1];
  /** 안내 1~3단계는 결과 영역에 카드만 (상위 스펙 5.1) */
  const cardOnly = guide !== null && guide < 4;
  const empty = result === null && status === "idle";
  const samples = result?.paths.subjects.find((s) => s.round === 1)?.samples.length ?? 0;

  const isLeftOpen = !leftDrawer.isCollapsed;
  const isRightOpen = guide === null && !rightDrawer.isCollapsed;

  return (
    <TooltipProvider>
      <div
        style={{
          "--rail-width": `${leftDrawer.width}px`,
          "--inspector-width": `${rightDrawer.width}px`,
        } as React.CSSProperties}
        className={cn(
          "relative grid gap-6 md:gap-10 grid-cols-1",
          isLeftOpen && isRightOpen && "md:grid-cols-[var(--rail-width)_minmax(0,1fr)_var(--inspector-width)]",
          isLeftOpen && !isRightOpen && "md:grid-cols-[var(--rail-width)_minmax(0,1fr)]",
          !isLeftOpen && isRightOpen && "md:grid-cols-[minmax(0,1fr)_var(--inspector-width)]",
          !isLeftOpen && !isRightOpen && "md:grid-cols-1",
        )}
      >
        <div className={cn("relative md:sticky md:top-20 md:self-start", leftDrawer.isCollapsed && "md:hidden")}>
          <LabRail
            onCollapse={leftDrawer.toggleCollapse}
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
          <ResizeHandle
            isDragging={leftDrawer.isDragging}
            isCollapsed={leftDrawer.isCollapsed}
            width={leftDrawer.width}
            minWidth={leftDrawer.minWidth}
            maxWidth={leftDrawer.maxWidth}
            onPointerDown={leftDrawer.handlePointerDown}
            onPointerMove={leftDrawer.handlePointerMove}
            onPointerUp={leftDrawer.handlePointerUp}
            onKeyDown={leftDrawer.handleKeyDown}
            className="absolute -right-5 top-0 bottom-0 z-30"
          />
        </div>
        {/** 안내 중에는 "지금 할 일" 카드가 먼저 보여야 한다. 좁은 화면에서는 한 줄이라
          *  레일 전체가 카드를 밀어낸다. 일반 모드는 레일이 먼저(모바일 e2e 가 기댄다) */}
        <div className={cn("flex min-w-0 flex-col gap-8", guide !== null && "order-first md:order-none")}>
          {(leftDrawer.isCollapsed || (guide === null && rightDrawer.isCollapsed)) && (
            <div className="hidden items-center justify-between -mb-4 md:flex">
              <div>
                {leftDrawer.isCollapsed && (
                  <DrawerTrigger onClick={leftDrawer.toggleCollapse} />
                )}
              </div>
              <div>
                {guide === null && rightDrawer.isCollapsed && (
                  <DrawerTrigger
                    side="right"
                    label="분석 열기"
                    icon={PanelRightOpen}
                    onClick={rightDrawer.toggleCollapse}
                  />
                )}
              </div>
            </div>
          )}
        {guide !== null && (
          <GuideCard
            step={guide}
            config={config}
            request={request}
            result={result}
            onNext={() => dispatch({ type: "guide:next" })}
          />
        )}
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
                {result && (
                  <VerdictTable
                    result={result}
                    focus={state.focus}
                    onFocus={(f) => dispatch({ type: "focus", value: f })}
                  />
                )}
              </ResultSection>
            </div>
          </>
        )}
        </div>
        {isRightOpen && (
          <div className="relative md:sticky md:top-20 md:self-start">
            <ResizeHandle
              side="left"
              isDragging={rightDrawer.isDragging}
              isCollapsed={rightDrawer.isCollapsed}
              width={rightDrawer.width}
              minWidth={rightDrawer.minWidth}
              maxWidth={rightDrawer.maxWidth}
              onPointerDown={rightDrawer.handlePointerDown}
              onPointerMove={rightDrawer.handlePointerMove}
              onPointerUp={rightDrawer.handlePointerUp}
              onKeyDown={rightDrawer.handleKeyDown}
              className="absolute -left-5 top-0 bottom-0 z-30"
            />
            <LabInspector
              onCollapse={rightDrawer.toggleCollapse}
              config={config}
              request={request}
              result={result}
              focus={state.focus}
              onFocus={(f) => dispatch({ type: "focus", value: f })}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
