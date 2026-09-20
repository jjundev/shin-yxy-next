import { ArrowRight, Check } from "lucide-react";
import { strings } from "@/content/strings";
import { Button } from "@/design/ui/button";
import { cn } from "@/lib/utils";
import type { GuideStep } from "./guide";

interface ChecklistProps {
  step: GuideStep;
  onSkip: () => void;
}

/** 레일 맨 위 네 단계 체크리스트 + 건너뛰기 (상위 스펙 5.1, 5.3) */
export function Checklist({ step, onSkip }: ChecklistProps) {
  const t = strings.lab.guide;
  return (
    <nav aria-label={t.title} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">{t.title}</h2>
        <Button variant="ghost" size="xs" onClick={onSkip}>{t.skip}</Button>
      </div>
      <ol className="flex flex-col gap-1 text-sm">
        {t.steps.map((s, i) => {
          const n = (i + 1) as GuideStep;
          const done = n < step;
          const now = n === step;
          return (
            <li
              key={s.name}
              aria-current={now ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1",
                now && "bg-accent font-medium text-accent-foreground",
                !now && "text-muted-foreground",
              )}
            >
              {done ? (
                <>
                  <Check className="size-4 text-up" aria-hidden="true" />
                  <span className="sr-only">{t.stepDone}</span>
                </>
              ) : now ? (
                <ArrowRight className="size-4" aria-hidden="true" />
              ) : (
                <span className="num w-4 text-center text-xs">{n}</span>
              )}
              <span>{s.name}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
