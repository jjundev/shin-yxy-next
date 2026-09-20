import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { strings } from "@/content/strings";
import { label } from "@/content/labels";
import { cn } from "@/lib/utils";

interface LabRailProps {
  when: ReactNode;
  ingredients?: ReactNode;
}

const HEADING = "text-sm font-semibold text-muted-foreground";

/** 왼쪽 레일. 데스크톱은 sticky, 모바일은 "무엇으로" 만 접힌다(스펙 3.2, 설계 결정 12) */
export function LabRail({ when, ingredients }: LabRailProps) {
  const [open, setOpen] = useState(false);
  const t = strings.lab.what;
  const heading = (
    <>
      {t.title} <span className="font-normal">· {label("재료")}</span>
    </>
  );
  return (
    <aside
      aria-label={strings.lab.settingsLabel}
      className="flex flex-col gap-6 rounded-lg border bg-card p-4 md:sticky md:top-20 md:max-h-[calc(100dvh-6rem)] md:self-start md:overflow-y-auto"
    >
      {when}
      {ingredients && (
        <section className="flex flex-col gap-3" aria-labelledby="what-title">
          {/* md+ 는 본문이 늘 펼쳐져 있으므로 여는 단추 자체를 치운다. 초점도 안 간다 */}
          <button
            type="button"
            className="flex w-full items-center gap-1 text-left md:hidden"
            aria-expanded={open}
            aria-controls="what-body"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            <h2 className={HEADING}>{heading}</h2>
          </button>
          <h2 id="what-title" className={cn(HEADING, "hidden md:block")}>
            {heading}
          </h2>
          <div id="what-body" className={cn("flex flex-col gap-3", !open && "hidden md:flex")}>
            {ingredients}
          </div>
        </section>
      )}
    </aside>
  );
}
