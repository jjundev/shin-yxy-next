import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "@/api/client";
import { strings } from "@/content/strings";
import type { SavedExperiment } from "@/demo/saved";
import { experimentVerdict } from "@/demo/verdict";
import { Button } from "@/design/ui/button";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

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
            <li className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:gap-4" key={s.id}>
              <div className="num text-sm">
                <div>{s.request.asOf}</div>
                <div className="text-muted-foreground">
                  {s.request.horizonDays}
                  {strings.saved.tradingDays}
                </div>
              </div>
              <div className="text-sm sm:min-w-0 sm:flex-1">{s.result.avgReturn === null ? "" : formatPct(s.result.avgReturn)}</div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                    verdict === "SUCCESS" && "bg-accent text-accent-foreground",
                    verdict === "FAIL" && "bg-muted text-muted-foreground",
                    verdict === "PENDING" && "border text-muted-foreground",
                  )}
                >
                  {strings.verdict[verdict]}
                </span>
                <Button variant="outline" size="sm" onClick={() => {}}>{strings.saved.open}</Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
