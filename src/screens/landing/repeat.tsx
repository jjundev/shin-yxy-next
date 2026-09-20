import { useEffect, useState, type CSSProperties } from "react";
import { api } from "@/api/client";
import { summaryText } from "@/components/summary-text";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import type { SavedExperiment } from "@/demo/saved";
import { experimentVerdict } from "@/demo/verdict";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LandingSection } from "./section";

const t = landing.repeat;

/** 저장소 시드 셋. 실패하면 빈 배열 — 이 섹션의 글은 데이터 없이도 읽힌다 */
function useSavedSeed(): SavedExperiment[] {
  const [items, setItems] = useState<SavedExperiment[]>([]);
  useEffect(() => {
    let alive = true;
    api.saved().then(
      (list) => {
        if (alive) setItems(list.slice(0, 3));
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, []);
  return items;
}

/** S11. 겹쳐 있던 카드 셋이 스크롤과 함께 펼쳐진다. 저장소의 진짜 시드다 */
export function Repeat() {
  const items = useSavedSeed();

  return (
    <LandingSection id="repeat" title={t.title} lead={t.body} scrub>
      {items.length > 0 && (
        <ul aria-label={strings.saved.title} className="mx-auto flex w-full max-w-content flex-col gap-4">
          {items.map((s, i) => {
            const verdict = experimentVerdict(s.result);
            return (
              <li
                key={s.id}
                style={{ "--k": items.length - 1 - i } as CSSProperties}
                className="deck-card flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm sm:flex-row sm:items-start sm:gap-4"
              >
                <div className="num text-sm sm:w-28 sm:shrink-0">
                  <div>{s.request.asOf}</div>
                  <div className="text-muted-foreground">
                    {s.request.horizonDays}
                    {strings.saved.tradingDays}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {strings.saved.savedAt} {formatDate(s.savedAt)}
                  </div>
                </div>
                <p className="min-w-0 flex-1 text-sm break-keep">{summaryText(s.result)}</p>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap sm:shrink-0",
                    verdict === "SUCCESS" && "bg-accent text-accent-foreground",
                    verdict === "FAIL" && "bg-muted text-muted-foreground",
                    verdict === "PENDING" && "border text-muted-foreground",
                  )}
                >
                  {strings.verdict[verdict]}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </LandingSection>
  );
}
