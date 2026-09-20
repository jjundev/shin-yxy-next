import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HORIZON_CHOICES } from "@/content/constants";
import { strings } from "@/content/strings";
import type { LabConfig, RunRequest } from "@/demo/types";
import { Button } from "@/design/ui/button";
import { nearestWeekdayIndex, weekdaysBetween } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Status } from "./state";

export interface WhenProps {
  config: LabConfig;
  request: RunRequest;
  status: Status;
  hasResult: boolean;
  dirty: boolean;
  canSave: boolean;
  saved: boolean;
  viewingSaved: boolean;
  onAsOf: (v: string) => void;
  onHorizon: (v: number) => void;
  onRun?: () => void;
  onSave: () => void;
}

const t = strings.lab.when;

export function WhenSection(p: WhenProps) {
  const days = useMemo(() => weekdaysBetween(p.config.dataStart, p.config.dataEnd), [p.config.dataStart, p.config.dataEnd]);
  const idx = nearestWeekdayIndex(days, p.request.asOf);
  const last = days.length - 1;
  const running = p.status === "running";
  return (
    <section className="flex flex-col gap-2.5" aria-labelledby="when-title">
      <h2 id="when-title" className="text-xs font-semibold text-muted-foreground">{t.title}</h2>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs">{t.asOf}</span>
          <span className="num text-xs font-medium">{days[idx]}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="size-6" aria-label={t.dayBefore} disabled={idx === 0} onClick={() => p.onAsOf(days[idx - 1])}>
            <ChevronLeft className="size-3.5" />
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
          <Button variant="ghost" size="icon-sm" className="size-6" aria-label={t.dayAfter} disabled={idx === last} onClick={() => p.onAsOf(days[idx + 1])}>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
        <div className="num flex justify-between text-[11px] text-muted-foreground">
          <span>{days[0]}</span>
          <span>{idx === last ? t.today : t.weekdaysAgo(last - idx)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{t.horizon}</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label={t.horizon}>
          {HORIZON_CHOICES.map((h) => (
            <Button
              key={h}
              type="button"
              size="sm"
              variant={p.request.horizonDays === h ? "secondary" : "ghost"}
              aria-pressed={p.request.horizonDays === h}
              className={cn("num h-7 px-2 text-xs", p.request.horizonDays === h && "font-semibold")}
              onClick={() => p.onHorizon(h)}
            >
              {t.tradingDays(h)}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Button variant="outline" size="sm" className="w-full h-8 text-xs" disabled={!p.canSave || running} onClick={p.onSave}>
          {p.saved ? t.saved : t.save}
        </Button>
        <p
          role="status"
          aria-label={t.statusLabel}
          className={cn("text-xs text-muted-foreground", !(running || p.viewingSaved) && "hidden")}
        >
          {running ? t.running : p.viewingSaved ? t.viewingSaved(p.request.asOf) : ""}
        </p>
      </div>
    </section>
  );
}
