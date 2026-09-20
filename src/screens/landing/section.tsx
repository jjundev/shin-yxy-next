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
  className?: string;
  children: ReactNode;
}

/** 랜딩 섹션 하나: 제목 + 리드 + 본문. 스크롤 진행값 --p 를 자기 요소에 건다.
 *  표현은 전부 landing.css 가 --p 를 읽어서 한다 */
export function LandingSection({ id, title, lead, rest, span, className, children }: LandingSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const headingId = useId();
  useScrollProgress(ref, { rest, span });
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className={cn("relative px-4 py-24 md:py-32", className)}
    >
      <div className="mx-auto flex max-w-wide flex-col gap-12">
        <header className="mx-auto flex w-full max-w-content flex-col gap-3">
          <h2 id={headingId} className="rise text-2xl font-semibold break-keep md:text-3xl">
            {title}
          </h2>
          {lead && (
            <p
              className="rise text-base break-keep text-muted-foreground md:text-lg"
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
