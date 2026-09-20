import type { ReactNode } from "react";
import { strings } from "@/content/strings";
import { Button } from "@/design/ui/button";
import { Skeleton } from "@/design/ui/skeleton";
import type { Status } from "./state";

interface ResultSectionProps {
  title: string;
  status: Status;
  error: string | null;
  onRetry: () => void;
  /** WhySheet 요소 */
  why: ReactNode;
  children: ReactNode;
}

/** 결과 섹션 하나: 제목 + 왜? + (뼈대 | 오류 한 줄 + 다시 시도 | 본문) */
export function ResultSection({ title, status, error, onRetry, why, children }: ResultSectionProps) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby={`sec-${title}`}>
      <div className="flex items-center gap-2">
        <h2 id={`sec-${title}`} className="text-lg font-semibold">{title}</h2>
        {why}
      </div>
      {status === "running" ? (
        <div role="status" aria-label={strings.lab.loading} className="flex flex-col gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : status === "error" ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-4 text-sm">
          <span>{error ?? strings.lab.runFailed}</span>
          <Button variant="outline" size="sm" onClick={onRetry}>{strings.lab.retry}</Button>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
