import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, PanelLeftClose } from "lucide-react";
import { Button } from "@/design/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/design/ui/tooltip";
import { strings } from "@/content/strings";
import { label } from "@/content/labels";
import { cn } from "@/lib/utils";

interface LabRailProps {
  /** 안내 모드의 체크리스트. 레일 맨 위 (상위 스펙 5.1) */
  checklist?: ReactNode;
  when: ReactNode;
  ingredients?: ReactNode;
  /** 지금 안내 단계가 아닌 섹션을 흐리게. 막지는 않는다 (5.3) */
  dim?: { when?: boolean; ingredients?: boolean };
  /** true 가 되면 모바일 접힘을 편다. 안내 2단계가 재료를 보여 줘야 한다 */
  openIngredients?: boolean;
  /** 데스크톱 레일 접기 콜백 */
  onCollapse?: () => void;
}

const HEADING = "text-sm font-semibold text-muted-foreground";

/** 왼쪽 레일. 데스크톱은 sticky, 모바일은 "무엇으로" 만 접힌다(스펙 3.2, 설계 결정 12) */
export function LabRail({
  checklist,
  when,
  ingredients,
  dim,
  openIngredients,
  onCollapse,
}: LabRailProps) {
  const [open, setOpen] = useState(!!openIngredients);
  // openIngredients 가 켜지는 순간에만 편다. 그 뒤 접는 건 여전히 사람 몫이므로
  // 파생값이 아니라 "prop 이 바뀔 때 state 를 맞추는" 렌더 중 조정이다
  const [wasOpening, setWasOpening] = useState(openIngredients);
  if (openIngredients !== wasOpening) {
    setWasOpening(openIngredients);
    if (openIngredients) setOpen(true);
  }
  const t = strings.lab.what;
  const heading = (
    <>
      {t.title} <span className="font-normal">· {label("재료")}</span>
    </>
  );
  return (
    <aside
      aria-label={strings.lab.settingsLabel}
      className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:sticky md:top-20 md:max-h-[calc(100dvh-6rem)] md:self-start md:overflow-y-auto"
    >
      {checklist}
      {onCollapse && (
        <div className="hidden items-center justify-between border-b pb-2 md:flex">
          <span className="text-xs font-semibold text-muted-foreground">실험실 세팅</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={onCollapse}
                aria-label="설정 패널 접기"
              >
                <PanelLeftClose className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">설정 패널 접기</TooltipContent>
          </Tooltip>
        </div>
      )}
      <div data-slot="when" className={cn(dim?.when && "opacity-50")}>{when}</div>
      {ingredients && (
        <section className={cn("flex flex-col gap-2", dim?.ingredients && "opacity-50")} aria-labelledby="what-title">
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
          <div id="what-body" className={cn("flex flex-col gap-2", !open && "hidden md:flex")}>
            {ingredients}
          </div>
        </section>
      )}
    </aside>
  );
}
