import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { strings } from "@/content/strings";
import { label } from "@/content/labels";
import type { Contribution, InstrumentRow, PathSubject, RunResult, Subject } from "@/demo/types";
import { inRange, selectedHits, subjectVerdict, type SubjectVerdict } from "@/demo/verdict";
import { formatPct, horizonLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";

const t = strings.lab.verdict;

function tone(v: number | null): string | undefined {
  return v === null ? undefined : v >= 0 ? "text-up" : "text-down";
}

const VERDICT_TONE: Record<SubjectVerdict, string> = {
  SUCCESS: "bg-accent text-accent-foreground",
  DIRECTION_ONLY: "border text-foreground",
  FAIL: "bg-muted text-muted-foreground",
  PENDING: "border text-muted-foreground",
};

function pickState(s: Subject, isMarket: boolean): string {
  if (isMarket) return t.pick.base;
  if (s.selected) return label("뽑음");
  if (s.excludedStage === "BELOW_START") return t.pick.belowStart;
  if (s.excludedStage === "FILTER") return t.pick.filtered;
  return label("안 뽑음");
}

/** 방향을 민 재료 상위 셋. 원본 "무엇이 밀었나" */
function topShifts(c: Contribution[]): Contribution[] {
  return c.filter((x) => x.branch === "SHIFT").sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 3);
}

function Tri({ s }: { s: Subject }) {
  const up = Math.round(s.upProbability * 100);
  const flat = Math.round(s.flatProbability * 100);
  const down = Math.max(0, 100 - up - flat);
  return (
    <span className="flex flex-col gap-0.5" role="img" aria-label={t.tri(up, flat, down)}>
      <span className="num text-xs">{up} · {flat} · {down}</span>
      <span className="flex h-1 w-20 overflow-hidden rounded-sm bg-muted" aria-hidden="true">
        <i className="bg-up" style={{ width: `${up}%` }} />
        <i className="bg-flat" style={{ width: `${flat}%` }} />
        <i className="bg-down" style={{ width: `${down}%` }} />
      </span>
    </span>
  );
}

interface RowProps {
  s: Subject;
  isMarket: boolean;
  leader: InstrumentRow | undefined;
  path: PathSubject | undefined;
  horizon: string;
}

function Row({ s, isMarket, leader, path, horizon }: RowProps) {
  const [open, setOpen] = useState(false);
  const verdict = subjectVerdict(s);
  const name = isMarket ? t.market : s.name;
  const shifts = topShifts(s.contributions);
  return (
    <>
      <tr className={cn("border-t", !isMarket && !s.selected && "text-muted-foreground")}>
        <td className="py-2 pr-2">
          <button type="button" className="inline-flex items-center gap-1 text-left" aria-expanded={open} aria-label={t.detail(name)} onClick={() => setOpen((o) => !o)}>
            {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            <span className="text-foreground">{name}</span>
          </button>
        </td>
        <td className="py-2 pr-2">
          {leader ? (
            <span className="flex flex-col">
              <span>{leader.name}</span>
              <small className="num text-xs">
                <span className={tone(leader.center)}>{formatPct(leader.center)}</span>
                {leader.ret !== null && <> → <span className={tone(leader.ret)}>{formatPct(leader.ret)}</span></>}
              </small>
            </span>
          ) : (
            <span className="text-muted-foreground">{isMarket ? t.kospi : "—"}</span>
          )}
        </td>
        <td className="hidden py-2 pr-2 md:table-cell">
          {path && path.expected.length > 1 ? (
            <Sparkline expected={path.expected} low={path.low} high={path.high} actual={path.actual} label={`${name} ${horizon} ${t.columns.flow}`} />
          ) : "—"}
        </td>
        <td className="hidden py-2 pr-2 md:table-cell"><Tri s={s} /></td>
        <td className={cn("num py-2 pr-2 text-right", tone(s.center))}>{formatPct(s.center)}</td>
        <td className={cn("num py-2 pr-2 text-right", tone(s.actual))}>{formatPct(s.actual)}</td>
        <td className="py-2 pr-2">
          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", VERDICT_TONE[verdict])}>{strings.subjectVerdict[verdict]}</span>
        </td>
        <td className="py-2 text-xs" title={s.excludedReason ?? undefined}>{pickState(s, isMarket)}</td>
      </tr>
      {open && (
        <tr className="bg-muted/40">
          <td colSpan={8} className="px-3 py-2 text-sm">
            <span className="font-medium">{t.pushed}</span>{" "}
            {shifts.length
              ? shifts.map((c) => (
                  <span key={c.moduleKey} className="mr-3">{c.moduleName} <span className={cn("num", tone(c.value))}>{formatPct(c.value)}</span></span>
                ))
              : (s.excludedReason ?? "—")}
          </td>
        </tr>
      )}
    </>
  );
}

export function VerdictTable({ result }: { result: RunResult }) {
  const horizon = horizonLabel(result.horizonDays);
  const leaderOf = (sectorId: number) => result.rows.find((r) => r.sectorId === sectorId);
  const pathOf = (round: 0 | 1, subjectId: number) =>
    result.paths.subjects.find((p) => p.round === round && p.subjectId === subjectId);
  const picked = result.round1.estimates.filter((s) => s.selected);
  const scored = picked.filter((s) => s.actual !== null);
  const hits = selectedHits(result.round1.estimates);
  const ranges = scored.filter((s) => inRange(s, s.actual) === true).length;
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const meanCenter = mean(picked.map((s) => s.center));
  const meanActual = mean(scored.map((s) => s.actual as number));
  const c = t.columns;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th className="pb-2 pr-2 font-medium">{c.sector}</th>
            <th className="pb-2 pr-2 font-medium">{c.leader}</th>
            <th className="hidden pb-2 pr-2 font-medium md:table-cell">{c.flow} <span className="font-normal">{c.flowHint(horizon)}</span></th>
            <th className="hidden pb-2 pr-2 font-medium md:table-cell">{c.tri}</th>
            <th className="pb-2 pr-2 text-right font-medium">{c.expected}</th>
            <th className="pb-2 pr-2 text-right font-medium">{c.actual(horizon)}</th>
            <th className="pb-2 pr-2 font-medium">{c.verdict}</th>
            <th className="pb-2 font-medium">{c.pick}</th>
          </tr>
        </thead>
        <tbody>
          <Row s={result.market} isMarket leader={undefined} path={pathOf(0, result.market.subjectId)} horizon={horizon} />
          {result.round1.estimates.map((s) => (
            <Row key={s.subjectId} s={s} isMarket={false} leader={leaderOf(s.subjectId)} path={pathOf(1, s.subjectId)} horizon={horizon} />
          ))}
        </tbody>
        {picked.length > 0 && (
          <tfoot className="border-t text-xs text-muted-foreground">
            <tr>
              <td colSpan={4} className="py-2 pr-2">
                <span>{t.footer(picked.length)}</span>
                {scored.length > 0 && <span className="num ml-2">{t.hits(hits.hits, ranges, scored.length)}</span>}
              </td>
              <td className={cn("num py-2 pr-2 text-right", tone(meanCenter))}>{formatPct(meanCenter)}</td>
              <td className={cn("num py-2 pr-2 text-right", tone(meanActual))}>{formatPct(meanActual)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
