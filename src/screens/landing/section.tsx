import { useId, useRef, type CSSProperties, type ReactNode } from "react";
import { useScrollProgress, type ProgressSpan } from "@/hooks/use-scroll-progress";
import { cn } from "@/lib/utils";

interface LandingSectionProps {
  /** 앵커이자 e2e 가 짚는 자리 */
  id: string;
  title: string;
  /** 제목 아래 한 문단 */
  lead?: string;
  /** 감속 모션·jsdom 에서 고정할 진행값. 섹션마다 가장 읽기 좋은 상태 */
  rest?: number;
  span?: ProgressSpan;
  /** 스크럽 섹션. 화면 높이의 1.8배를 차지하고 본문은 sticky 로 붙어 있는다.
   *  그래야 --p 가 넉넉한 스크롤 거리 위에서 0→1 을 훑는다. span="cover" 를 함의한다 */
  scrub?: boolean;
  /** CSS 로 못 하는 것만(터널의 프레임 src). 매 프레임 불린다 — React state 를 건드리지 말 것.
   *  sticky 무대 위의 자식은 화면에 붙어 있어 자기 기하로 진행값을 잴 수 없다.
   *  그래서 섹션이 재서 내려 준다 */
  onFrame?: (p: number) => void;
  className?: string;
  children: ReactNode;
}

/** 랜딩 섹션 하나: 제목 + 리드 + 본문. 스크롤 진행값 --p 를 자기 요소에 건다.
 *  표현은 전부 landing.css 가 --p 를 읽어서 한다 */
export function LandingSection({ id, title, lead, rest, span, scrub, onFrame, className, children }: LandingSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const headingId = useId();
  useScrollProgress(ref, { rest, span: scrub ? "cover" : span, onFrame });
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className={cn("relative px-4", scrub ? "min-h-[180vh]" : "py-24 md:py-32", className)}
    >
      <div
        data-slot={scrub ? "scrub-stage" : undefined}
        className={cn(
          "mx-auto flex w-full max-w-wide flex-col gap-12",
          scrub && "sticky top-0 min-h-dvh justify-center py-24",
        )}
      >
        <header className="mx-auto flex w-full max-w-content flex-col gap-3">
          {/* 스크럽 섹션의 제목은 .rise 를 안 쓴다 — sticky 로 내내 붙어 있으므로
              --p 가 0 인 동안 유령처럼 흐려 보이면 안 된다 (실측 opacity 0.02) */}
          <h2 id={headingId} className={cn("text-2xl font-semibold break-keep md:text-3xl", !scrub && "rise")}>
            {title}
          </h2>
          {lead && (
            <p
              className={cn("text-base break-keep text-muted-foreground md:text-lg", !scrub && "rise")}
              style={{ "--d": 0.2 } as CSSProperties}
            >
              {lead}
            </p>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}
