import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { strings } from "@/content/strings";
import type { LabConfig, RunRequest } from "@/demo/types";
import { Button } from "@/design/ui/button";
import { nearestWeekdayIndex, weekdaysBetween } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Status } from "./state";

/** 원본 vj. config.horizonChoices(1~22)가 아니라 원본 화면의 네 칩 */
const HORIZONS = [1, 5, 10, 20];

export interface WhenProps {
  config: LabConfig;
  request: RunRequest;
  status: Status;
  hasResult: boolean;
  dirty: boolean;
  canSave: boolean;
  saved: boolean;
  onAsOf: (v: string) => void;
  onHorizon: (v: number) => void;
  onRun: () => void;
  onSave: () => void;
}

const t = strings.lab.when;

export function WhenSection(p: WhenProps) {
  const days = useMemo(() => weekdaysBetween(p.config.dataStart, p.config.dataEnd), [p.config.dataStart, p.config.dataEnd]);
  const idx = nearestWeekdayIndex(days, p.request.asOf);
  const last = days.length - 1;
  const running = p.status === "running";
  return (
    <section className="flex flex-col gap-4" aria-labelledby="when-title">
      <h2 id="when-title" className="text-sm font-semibold text-muted-foreground">{t.title}</h2>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm">{t.asOf}</span>
          <span className="num text-sm font-medium">{days[idx]}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={t.dayBefore} disabled={idx === 0} onClick={() => p.onAsOf(days[idx - 1])}>
            <ChevronLeft />
          </Button>
          <input
            type="range"
            aria-label={t.asOf}
            aria-valuetext={days[idx]}
            className="w-full accent-primary"
            min={0}
            max={last}
            step={1}
            value={idx}
            onChange={(e) => p.onAsOf(days[Number(e.target.value)])}
          />
          <Button variant="ghost" size="icon-sm" aria-label={t.dayAfter} disabled={idx === last} onClick={() => p.onAsOf(days[idx + 1])}>
            <ChevronRight />
          </Button>
        </div>
        <div className="num flex justify-between text-xs text-muted-foreground">
          <span>{days[0]}</span>
          <span>{idx === last ? t.today : t.weekdaysAgo(last - idx)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm">{t.horizon}</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label={t.horizon}>
          {HORIZONS.map((h) => (
            <Button
              key={h}
              type="button"
              size="sm"
              variant={p.request.horizonDays === h ? "secondary" : "ghost"}
              aria-pressed={p.request.horizonDays === h}
              className={cn("num", p.request.horizonDays === h && "font-semibold")}
              onClick={() => p.onHorizon(h)}
            >
              {t.tradingDays(h)}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button className="flex-1" variant={p.dirty || !p.hasResult ? "default" : "outline"} disabled={running} onClick={p.onRun}>
            {running ? t.running : t.run}
          </Button>
          <Button variant="outline" disabled={!p.canSave} onClick={p.onSave}>
            {p.saved ? t.saved : t.save}
          </Button>
        </div>
        <p role="status" aria-label={t.statusLabel} className="min-h-4 text-xs text-muted-foreground">
          {p.dirty ? t.dirty : ""}
        </p>
      </div>
    </section>
  );
}
