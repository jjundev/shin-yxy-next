import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { strings } from "@/content/strings";
import { TERM_GLOSSARY, label } from "@/content/labels";
import { WHY_PICKS, WHY_VERDICT, whyCalc } from "@/content/why";
import type { LabConfig, RunRequest, RunResult } from "@/demo/types";
import { Button } from "@/design/ui/button";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/design/ui/sheet";

interface WhySheetProps {
  title: string;
  description: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** 섹션 제목 옆 "왜?" 버튼과 그것이 여는 오른쪽 시트. 설명 산문은 여기에만 산다(스펙 3.3) */
export function WhySheet({ title, description, children, open, onOpenChange }: WhySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <HelpCircle className="size-4" />
          {strings.lab.why}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6 text-sm leading-relaxed break-keep">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function WhyCalc({ config, request, result }: { config: LabConfig; request: RunRequest; result: RunResult | null }) {
  const w = whyCalc(config, request, result);
  return (
    <>
      <ol className="flex flex-col gap-3">
        {w.steps.map((s) => (
          <li key={s.n} className="flex gap-3">
            <b className="num text-muted-foreground">{s.n}</b>
            <div>
              <b>{s.head}</b>
              <p className="mt-1">{s.body}</p>
              <span className="num text-xs text-muted-foreground">{s.foot}</span>
            </div>
          </li>
        ))}
      </ol>
      <p>{w.closing}</p>
    </>
  );
}

export function WhyPicks({ samples }: { samples: number }) {
  return (
    <>
      <p>{WHY_PICKS.legendActual}</p>
      <p>{WHY_PICKS.legendRolled(samples)}</p>
      <p>{WHY_PICKS.band}</p>
      <dl className="flex flex-col gap-2 border-t pt-3">
        {WHY_PICKS.glossary.map((term) => (
          <div key={term}>
            <dt className="font-medium">{label(term)} <span className="text-muted-foreground">· {term}</span></dt>
            <dd>{TERM_GLOSSARY[term]}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function WhyVerdict({ asOf }: { asOf: string }) {
  return (
    <>
      <b>{WHY_VERDICT.title}</b>
      <dl className="flex flex-col gap-2">
        {WHY_VERDICT.items.map((it) => (
          <div key={it.term}>
            <dt className="font-medium">{it.term}</dt>
            <dd>{it.body(asOf)}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t pt-3">{WHY_VERDICT.rule}</p>
    </>
  );
}
