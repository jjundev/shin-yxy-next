import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "@/api/client";
import { setLabIntent } from "@/app/lab-intent";
import { summaryText } from "@/components/summary-text";
import { strings } from "@/content/strings";
import { enabledModuleCount } from "@/content/why";
import type { SavedExperiment } from "@/demo/saved";
import type { LabConfig } from "@/demo/types";
import { experimentVerdict } from "@/demo/verdict";
import { Button } from "@/design/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const t = strings.saved;

/** 상위 스펙 7장. 목록 하나, 카드마다 열기 하나 */
type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; items: SavedExperiment[]; config: LabConfig };

export function SavedScreen() {
  const [data, setData] = useState<LoadState>({ status: "loading" });
  const [tick, setTick] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    let alive = true;
    Promise.all([api.saved(), api.config()]).then(
      ([items, config]) => {
        if (alive) setData({ status: "ok", items, config });
      },
      () => {
        if (alive) setData({ status: "error" });
      },
    );
    return () => {
      alive = false;
    };
  }, [tick]);

  /** 다시 시도는 누른 자리에서 loading 으로 되돌린다(effect 안에서 하면 연쇄 렌더) */
  function retry() {
    setData({ status: "loading" });
    setTick((n) => n + 1);
  }

  if (data.status === "error") {
    return (
      <div className="mx-auto flex max-w-content flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-4 text-sm">
          <span>{t.loadFailed}</span>
          <Button variant="outline" size="sm" onClick={retry}>{strings.lab.retry}</Button>
        </div>
      </div>
    );
  }
  if (data.status === "loading") return null;
  const { items, config } = data;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-content flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">{t.empty}</p>
        <Button asChild><Link to="/lab">{t.toLab}</Link></Button>
      </div>
    );
  }

  /** 저장 항목은 자기 주소가 없다(상위 스펙 8). 메모리로 건네고 실험실이 받아 연다 */
  function open(s: SavedExperiment) {
    setLabIntent({ kind: "open", saved: s });
    navigate("/lab");
  }

  return (
    <div className="mx-auto flex max-w-content flex-col gap-4">
      <h1 className="text-xl font-semibold">{t.title}</h1>
      <ul className="flex flex-col gap-3">
        {items.map((s) => {
          const verdict = experimentVerdict(s.result);
          const picked = s.result.rows.filter((r) => r.selected).map((r) => r.sectorName);
          return (
            <li
              key={s.id}
              aria-label={t.card(s.request.asOf)}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="num text-sm sm:w-28 sm:shrink-0">
                <div>{s.request.asOf}</div>
                <div className="text-muted-foreground">{s.request.horizonDays}{t.tradingDays}</div>
                <div className="text-xs text-muted-foreground">{t.savedAt} {formatDate(s.savedAt)}</div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                <p className="break-keep">{summaryText(s.result)}</p>
                <p className="text-xs text-muted-foreground">
                  {t.modules(enabledModuleCount(config, s.request))} · {t.picked} {picked.length > 0 ? picked.join(" · ") : t.nonePicked}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:shrink-0">
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
                <Button variant="outline" size="sm" onClick={() => open(s)}>{t.open}</Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
