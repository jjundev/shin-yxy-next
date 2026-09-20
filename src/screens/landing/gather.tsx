import { useEffect, useState, type CSSProperties } from "react";
import { api } from "@/api/client";
import { FIXED_AS_OF, FIXED_HORIZON_DAYS } from "@/content/constants";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import type { LabEvent } from "@/demo/types";
import { cn } from "@/lib/utils";
import { LandingSection } from "./section";

const t = landing.gather;
const w = strings.lab.what;
const cy = w.cycle;

const CARDS = [
  { name: cy.title, hint: cy.hint },
  { name: w.news.title, hint: w.news.hint },
  { name: w.impact.title, hint: w.impact.hint },
];

/** 기준일에 알려져 있던 일정 둘과, 기준일 뒤에 알려진 일정 둘.
 *  실패하면 조용히 빈 배열을 준다 — 이 섹션의 나머지는 데이터 없이도 읽힌다 */
function useLateSample(): { known: LabEvent[]; unknown: LabEvent[] } {
  const [data, setData] = useState<{ known: LabEvent[]; unknown: LabEvent[] }>({ known: [], unknown: [] });
  useEffect(() => {
    let alive = true;
    api.events(FIXED_AS_OF, FIXED_HORIZON_DAYS).then(
      (r) => {
        if (alive) setData({ known: r.known.slice(0, 2), unknown: r.unknown.slice(0, 2) });
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

/** S4. 상위 스펙 6장 "3단계 설명" 의 1단계 — 모은다 */
export function Gather() {
  const { known, unknown } = useLateSample();
  const rows = [
    ...known.map((e) => ({ e, late: false })),
    ...unknown.map((e) => ({ e, late: true })),
  ];
  const cols = cy.columns;

  return (
    <LandingSection id="gather" title={t.title} lead={t.lead}>
      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((card, i) => (
          <div
            key={card.name}
            className="rise flex flex-col gap-2 rounded-lg border bg-card p-5"
            style={{ "--d": 0.1 + i * 0.12 } as CSSProperties}
          >
            <span className="text-base font-medium">{card.name}</span>
            <span className="text-sm break-keep text-muted-foreground">{card.hint}</span>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="rise flex flex-col gap-3" style={{ "--d": 0.5 } as CSSProperties}>
          <h3 className="text-base font-medium">{t.lateTitle}</h3>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[520px] text-sm" aria-label={t.lateTitle}>
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">{cols[0]}</th>
                  <th className="px-4 py-2 font-medium">{cols[1]}</th>
                  <th className="px-4 py-2 font-medium">{cols[3]}</th>
                  <th className="px-4 py-2 font-medium">{cols[5]}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ e, late }) => (
                  <tr
                    key={e.id}
                    data-late={late}
                    className={cn("border-t", late && "text-muted-foreground opacity-60")}
                  >
                    <td className="num px-4 py-2">{e.eventDate}</td>
                    <td className="px-4 py-2">{e.subjectName}</td>
                    <td className="px-4 py-2">{cy.types[e.eventType] ?? e.eventType}</td>
                    <td className="num px-4 py-2">
                      {e.knownAt}
                      {late && <span className="pl-2 text-xs">{t.lateBadge}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="max-w-content text-sm break-keep text-muted-foreground">{t.lateBody}</p>
        </div>
      )}
    </LandingSection>
  );
}
