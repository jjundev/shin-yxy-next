import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { strings } from "@/content/strings";
import { label } from "@/content/labels";
import { cn } from "@/lib/utils";

interface LabRailProps {
  when: ReactNode;
  ingredients?: ReactNode;
}

/** 왼쪽 레일. 데스크톱은 sticky, 모바일은 "무엇으로" 만 접힌다(스펙 3.2, 설계 결정 12) */
export function LabRail({ when, ingredients }: LabRailProps) {
  const [open, setOpen] = useState(false);
  const t = strings.lab.what;
  return (
    <aside
      aria-label={strings.lab.settingsLabel}
      className="flex flex-col gap-6 rounded-lg border bg-card p-4 md:sticky md:top-20 md:max-h-[calc(100dvh-6rem)] md:self-start md:overflow-y-auto"
    >
      {when}
      {ingredients && (
        <section className="flex flex-col gap-3" aria-labelledby="what-title">
          <button
            type="button"
            className="flex w-full items-center gap-1 text-left md:pointer-events-none"
            aria-expanded={open}
            aria-controls="what-body"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="md:hidden">{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</span>
            <h2 id="what-title" className="text-sm font-semibold text-muted-foreground">
              {t.title} <span className="font-normal">· {label("재료")}</span>
            </h2>
          </button>
          <div id="what-body" className={cn("flex flex-col gap-3", !open && "hidden md:flex")}>
            {ingredients}
          </div>
        </section>
      )}
    </aside>
  );
}
