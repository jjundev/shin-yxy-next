import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "@/api/client";
import { strings } from "@/content/strings";
import type { SavedExperiment } from "@/demo/saved";
import { experimentVerdict } from "@/demo/verdict";
import { Button } from "@/design/ui/button";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

const VERDICT_LABEL = { SUCCESS: "예상 성공", FAIL: "예상 실패", PENDING: "채점 전" } as const;

export function SavedScreen() {
  const [items, setItems] = useState<SavedExperiment[] | null>(null);
  useEffect(() => {
    api.saved().then(setItems);
  }, []);

  if (items === null) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-content flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">{strings.saved.empty}</p>
        <Button asChild><Link to="/lab">{strings.saved.toLab}</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-content flex-col gap-4">
      <h1 className="text-xl font-semibold">{strings.saved.title}</h1>
      <ul className="flex flex-col gap-3">
        {items.map((s) => {
          const verdict = experimentVerdict(s.result);
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
              <div className="num text-sm">
                <div>{s.request.asOf}</div>
                <div className="text-muted-foreground">{s.request.horizonDays}거래일</div>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                평균 <span className="num">{formatPct(s.result.avgReturn)}</span>, 시장{" "}
                <span className="num">{formatPct(s.result.benchReturn)}</span>
              </div>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium",
                  verdict === "SUCCESS" && "bg-accent text-accent-foreground",
                  verdict === "FAIL" && "bg-muted text-muted-foreground",
                )}
              >
                {VERDICT_LABEL[verdict]}
              </span>
              <Button variant="outline" size="sm" onClick={() => {}}>{strings.saved.open}</Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
