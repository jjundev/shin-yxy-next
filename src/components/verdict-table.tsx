import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { strings } from "@/content/strings";
import type { InstrumentRow, PathSubject, RunResult, Subject } from "@/demo/types";
import { inRange, selectedHits, subjectVerdict } from "@/demo/verdict";
import { formatPct, horizonLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { sameFocus, type Focus } from "./focus";
import { Sparkline } from "./sparkline";
import { pickState, tone, topShifts, VERDICT_TONE } from "./verdict-util";

const t = strings.lab.verdict;

export function Tri({ s }: { s: Subject }) {
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
  focus?: Focus | null;
  onFocus?: (f: Focus) => void;
}

function Row({ s, isMarket, leader, path, horizon, focus, onFocus }: RowProps) {
  const [open, setOpen] = useState(false);
  const verdict = subjectVerdict(s);
  const name = isMarket ? t.market : s.name;
  const shifts = topShifts(s.contributions);
  const f: Focus = { round: isMarket ? 0 : 1, subjectId: s.subjectId };
  const isFocused = sameFocus(f, focus ?? null);

  const handleClick = () => {
    setOpen((o) => !o);
    onFocus?.(f);
  };

  return (
    <>
      <tr className={cn("border-t transition-colors", isFocused && "bg-accent/40", !isMarket && !s.selected && "text-muted-foreground")}>
        <td className="py-2 pr-2">
          <button type="button" className="inline-flex items-center gap-1 text-left cursor-pointer" aria-expanded={open} aria-label={t.detail(name)} onClick={handleClick}>
            {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            <span className={cn("text-foreground", isFocused && "font-semibold")}>{name}</span>
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

export interface VerdictTableProps {
  result: RunResult;
  focus?: Focus | null;
  onFocus?: (f: Focus) => void;
}

export function VerdictTable({ result, focus, onFocus }: VerdictTableProps) {
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
      <table aria-label={t.title} className="w-full min-w-[520px] text-sm">
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
          <Row s={result.market} isMarket leader={undefined} path={pathOf(0, result.market.subjectId)} horizon={horizon} focus={focus} onFocus={onFocus} />
          {result.round1.estimates.map((s) => (
            <Row key={s.subjectId} s={s} isMarket={false} leader={leaderOf(s.subjectId)} path={pathOf(1, s.subjectId)} horizon={horizon} focus={focus} onFocus={onFocus} />
          ))}
        </tbody>
        {picked.length > 0 && (
          <tfoot className="border-t text-xs text-muted-foreground">
            <tr>
              <td colSpan={4} className="py-2 pr-2">
                {/** 안내 4단계가 관찰하는 표의 끝. 줄 전체는 좁은 화면에서 가로로 잘려
                  *  끝까지 내려가도 다 보이는 법이 없으므로, 잘리지 않는 이 글월을 본다 */}
                <span data-slot="verdict-footer" className="inline-flex flex-wrap items-baseline gap-x-2">
                  <span>{t.footer(picked.length)}</span>
                  {scored.length > 0 && <span className="num">{t.hits(hits.hits, ranges, scored.length)}</span>}
                </span>
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
