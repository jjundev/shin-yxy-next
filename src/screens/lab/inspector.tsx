import { useEffect, useState } from "react";
import { BarChart3, HelpCircle, PanelRightClose } from "lucide-react";
import type { Focus } from "@/components/focus";
import { Tri } from "@/components/verdict-table";
import { pickState, tone, topShifts, VERDICT_TONE } from "@/components/verdict-util";
import { strings } from "@/content/strings";
import type { LabConfig, RunRequest, RunResult, Subject } from "@/demo/types";
import { subjectVerdict } from "@/demo/verdict";
import { Button } from "@/design/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/design/ui/tooltip";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { WhyCalc, WhyPicks, WhyVerdict } from "./why-sheet";

interface LabInspectorProps {
  config: LabConfig;
  request: RunRequest;
  result: RunResult | null;
  focus: Focus | null;
  onFocus?: (f: Focus) => void;
  activeWhySection?: "summary" | "picks" | "verdict";
  onCollapse?: () => void;
}

type MainTab = "detail" | "why";
type WhySubTab = "summary" | "picks" | "verdict";

export function LabInspector({
  config,
  request,
  result,
  focus,
  onFocus,
  activeWhySection,
  onCollapse,
}: LabInspectorProps) {
  const [tab, setTab] = useState<MainTab>("detail");
  const [whyTab, setWhyTab] = useState<WhySubTab>(activeWhySection ?? "summary");

  useEffect(() => {
    if (activeWhySection) {
      setTab("why");
      setWhyTab(activeWhySection);
    }
  }, [activeWhySection]);

  const samples = result?.paths.subjects.find((s) => s.round === 1)?.samples.length ?? 0;

  // 활성 대상 찾기 (포커스가 없으면 1라운드 첫 번째 선택 항목 또는 첫 번째 항목)
  let currentSubject: Subject | null = null;
  let isMarket = false;

  if (result) {
    if (focus?.round === 0) {
      currentSubject = result.market;
      isMarket = true;
    } else if (focus?.round === 2) {
      currentSubject = result.round2.estimates.find((e) => e.subjectId === focus.subjectId) ?? null;
    } else if (focus?.round === 1) {
      currentSubject = result.round1.estimates.find((e) => e.subjectId === focus.subjectId) ?? null;
    }

    if (!currentSubject) {
      currentSubject =
        result.round1.estimates.find((e) => e.selected) ??
        result.round1.estimates[0] ??
        null;
    }
  }

  const shifts = currentSubject ? topShifts(currentSubject.contributions) : [];
  const verdict = currentSubject ? subjectVerdict(currentSubject) : null;

  return (
    <aside
      aria-label="분석 인스펙터"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:sticky md:top-20 md:max-h-[calc(100dvh-6rem)] md:self-start md:overflow-y-auto w-full"
    >
      {/* 상단 탭 헤더 */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab("detail")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              tab === "detail"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <BarChart3 className="size-3.5" />
            선택 상세
          </button>
          <button
            type="button"
            onClick={() => setTab("why")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              tab === "why"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <HelpCircle className="size-3.5" />
            해설 (Why)
          </button>
        </div>
        {onCollapse && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={onCollapse}
                aria-label="분석 패널 접기"
              >
                <PanelRightClose className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">분석 패널 접기</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* 탭 1: 선택 상세 (Focus Detail) */}
      {tab === "detail" && (
        <div className="flex flex-col gap-4">
          {!result || !currentSubject ? (
            <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
              ‘계산하기’를 누르면 선택한 대상의 상세 기여도와 분석 지표를 볼 수 있어요.
            </div>
          ) : (
            <>
              {/* 항목 헤더 */}
              <div className="flex flex-col gap-1.5 border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">{isMarket ? "KOSPI 기준 시장" : currentSubject.name}</h3>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {isMarket ? "기준 시장" : focus?.round === 2 ? "1등 종목" : "업종"}
                    </span>
                  </div>
                  {verdict && (
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                        VERDICT_TONE[verdict],
                      )}
                    >
                      {strings.subjectVerdict[verdict]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>상태: <b className="font-medium text-foreground">{pickState(currentSubject, isMarket)}</b></span>
                  <span>·</span>
                  <span>확신도: <span className="num font-medium text-foreground">{Math.round(currentSubject.conviction * 100)}%</span></span>
                </div>
              </div>

              {/* 수익률 및 신뢰 구간 수치 그리드 */}
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-2.5 text-xs">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">예상 수익률</span>
                  <span className={cn("num font-semibold text-sm", tone(currentSubject.center))}>
                    {formatPct(currentSubject.center)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">실제 수익률</span>
                  <span className={cn("num font-semibold text-sm", tone(currentSubject.actual))}>
                    {formatPct(currentSubject.actual)}
                  </span>
                </div>
                <div className="col-span-2 mt-1 border-t border-border/60 pt-1.5 flex justify-between text-[11px] text-muted-foreground">
                  <span>80% 신뢰 구간</span>
                  <span className="num font-mono">
                    [{formatPct(currentSubject.low80)} ~ {formatPct(currentSubject.high80)}]
                  </span>
                </div>
              </div>

              {/* 방향성 확률 (3분할 막대) */}
              <div className="flex flex-col gap-1.5 rounded-lg border p-3">
                <span className="text-xs font-medium text-muted-foreground">방향성 확률 분포</span>
                <Tri s={currentSubject} />
              </div>

              {/* 무엇이 밀었나 (Top Shifts 기여도) */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  방향을 민 상위 재료 (기여도)
                </span>
                {shifts.length > 0 ? (
                  <ul className="flex flex-col gap-1.5 text-xs">
                    {shifts.map((c) => (
                      <li
                        key={c.moduleKey}
                        className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5"
                      >
                        <span className="truncate">{c.moduleName}</span>
                        <span className={cn("num font-medium font-mono shrink-0 ml-2", tone(c.value))}>
                          {formatPct(c.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-md bg-muted/30 p-2 text-xs text-muted-foreground">
                    {currentSubject.excludedReason ?? "영향을 준 주요 재료가 없어요."}
                  </p>
                )}
              </div>

              {/* 빠른 선택 목록 (선택된 다른 업종들) */}
              {result.round1.estimates.length > 0 && onFocus && (
                <div className="mt-1 flex flex-col gap-1.5 border-t pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    선택된 다른 업종 보기
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.round1.estimates
                      .filter((e) => e.selected)
                      .map((e) => {
                        const isCurrent = currentSubject?.subjectId === e.subjectId && (!focus || focus.round === 1);
                        return (
                          <button
                            key={e.subjectId}
                            type="button"
                            onClick={() => onFocus({ round: 1, subjectId: e.subjectId })}
                            className={cn(
                              "rounded px-2 py-0.5 text-xs transition-colors",
                              isCurrent
                                ? "bg-primary text-primary-foreground font-medium"
                                : "bg-muted text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {e.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 탭 2: 해설 (Why) */}
      {tab === "why" && (
        <div className="flex flex-col gap-3">
          {/* 해설 세부 전환 버튼 */}
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setWhyTab("summary")}
              className={cn(
                "rounded py-1 font-medium transition-colors text-center",
                whyTab === "summary" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              계산
            </button>
            <button
              type="button"
              onClick={() => setWhyTab("picks")}
              className={cn(
                "rounded py-1 font-medium transition-colors text-center",
                whyTab === "picks" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              차트
            </button>
            <button
              type="button"
              onClick={() => setWhyTab("verdict")}
              className={cn(
                "rounded py-1 font-medium transition-colors text-center",
                whyTab === "verdict" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              판정
            </button>
          </div>

          <div className="flex flex-col gap-3 text-xs leading-relaxed break-keep border-t pt-2">
            {whyTab === "summary" && (
              <WhyCalc config={config} request={request} result={result} />
            )}
            {whyTab === "picks" && (
              <WhyPicks samples={samples} />
            )}
            {whyTab === "verdict" && (
              <WhyVerdict asOf={request.asOf} />
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
