import { strings } from "@/content/strings";
import { label } from "@/content/labels";
import type { PathSubject } from "@/demo/types";
import { inRange } from "@/demo/verdict";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { sameFocus, type Focus } from "./focus";
import { lastActual } from "./path-util";

const t = strings.lab.picks;

interface RankListProps {
  subjects: PathSubject[];
  focus: Focus | null;
  onFocus: (f: Focus) => void;
}

/** 원본 FA: 실제(없으면 예상) 내림차순 */
export function RankList({ subjects, focus, onFocus }: RankListProps) {
  const rows = subjects
    .map((s) => {
      const actual = lastActual(s);
      return { s, value: actual ?? s.center, guess: actual === null, range: actual === null ? null : inRange(s, actual) };
    })
    .sort((a, b) => b.value - a.value);
  return (
    <ol className="flex flex-col divide-y text-sm" aria-label={t.rankLabel}>
      {rows.map(({ s, value, guess, range }, i) => {
        const f: Focus = { round: s.round, subjectId: s.subjectId };
        const badge = s.round === 0 ? t.base : s.selected ? label("뽑음") : label("안 뽑음");
        return (
          <li key={`${s.round}:${s.subjectId}`}>
            <button
              type="button"
              aria-pressed={sameFocus(f, focus)}
              onClick={() => onFocus(f)}
              className={cn("flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-accent/60", sameFocus(f, focus) && "bg-accent")}
            >
              <span className="num w-5 text-xs text-muted-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">
                {s.name}
                <small className="ml-1.5 text-xs text-muted-foreground">
                  {badge}
                  {guess && ` · ${t.guess}`}
                  {range !== null && <span className={cn("ml-1", range ? "text-accent-foreground" : "text-destructive")}>{range ? t.inRange : t.outRange}</span>}
                </small>
              </span>
              <span className={cn("num", value >= 0 ? "text-up" : "text-down", guess && "opacity-60")}>{formatPct(value)}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
