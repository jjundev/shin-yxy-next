import type { ReactNode } from "react";
import { strings } from "@/content/strings";
import type { RunResult } from "@/demo/types";
import { excessReturn, experimentVerdict } from "@/demo/verdict";
import { formatPct, formatPp, horizonLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type Piece = string | { num: string; sign: number | null };

const t = strings.lab.summary;

function num(v: number | null, fmt: (v: number | null) => string = formatPct): Piece {
  return { num: fmt(v), sign: v };
}

/** 원본 uA 의 문장을 조각으로. 굵은 숫자는 { num } 조각 */
function pieces(r: RunResult): Piece[] {
  const picked = r.rows.filter((row) => row.selected);
  const total = r.round1.estimates.length;
  const horizon = horizonLabel(r.horizonDays);
  if (picked.length === 0) {
    return [t.sectors, num(null, () => t.count(total)), t.of, num(null, () => t.count(0)), t.noneLead, horizon, t.after, num(r.market.center), t.noneTail];
  }
  const expected = picked.reduce((a, row) => a + row.center, 0) / picked.length;
  const out: Piece[] = [
    t.sectors, num(null, () => t.count(total)), t.of, num(null, () => t.count(picked.length)),
    `(${picked.map((row) => row.sectorName).join(" · ")})`, t.picked, horizon, t.after,
    num(expected), t.expected,
  ];
  if (r.avgReturn === null) return [...out, t.notYet(horizon)];
  const excess = excessReturn(r);
  out.push(
    r.horizonReached ? t.actual : t.partial,
    num(r.avgReturn), t.bench, { num: formatPct(r.benchReturn), sign: null }, t.vsMarket,
    num(excess, formatPp), " ", excess !== null && excess >= 0 ? t.earnedMore : t.earnedLess,
  );
  if (r.costDrag > 0) out.push(t.cost, num(-r.costDrag, formatPp), t.costTail);
  out.push(". ", strings.verdict[experimentVerdict(r)], ".");
  return out;
}

export function summaryText(r: RunResult): string {
  return pieces(r).map((p) => (typeof p === "string" ? p : p.num)).join("");
}

function render(p: Piece, i: number): ReactNode {
  if (typeof p === "string") return p;
  const tone = p.sign === null ? undefined : p.sign >= 0 ? "text-up" : "text-down";
  return <b key={i} className={cn("num font-medium", tone)}>{p.num}</b>;
}

export function SummaryLine({ result }: { result: RunResult }) {
  return <p className="text-base leading-relaxed break-keep">{pieces(result).map(render)}</p>;
}
