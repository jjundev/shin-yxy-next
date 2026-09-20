import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { api } from "@/api/client";
import { strings } from "@/content/strings";
import { label } from "@/content/labels";
import type {
  EventsResponse, LabConfig, LabEvent, LabModule, NewsItem, NewsResponse, RunRequest,
} from "@/demo/types";
import { Button } from "@/design/ui/button";
import { Switch } from "@/design/ui/switch";
import { horizonLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { moduleState, roundsOf } from "./state";

const t = strings.lab.what;
const NONE = "—";

type Loaded<T> = { status: "loading" } | { status: "ok"; data: T } | { status: "error" };

/** asOf·horizon 이 바뀌면(= load 가 바뀌면) 다시 부른다. 실패는 상태로 남긴다.
 *  끝난 값에 "어느 부름의 것인지"를 적어 두어, effect 안에서 loading 으로 되돌리는
 *  여분의 렌더 없이 그냥 render 때 가려낸다 */
function useLoaded<T>(load: () => Promise<T>): [Loaded<T>, () => void] {
  const [tick, setTick] = useState(0);
  const [done, setDone] = useState<{ load: () => Promise<T>; tick: number; value: Loaded<T> } | null>(null);
  useEffect(() => {
    let alive = true;
    const settle = (value: Loaded<T>) => { if (alive) setDone({ load, tick, value }); };
    load().then((data) => settle({ status: "ok", data }), () => settle({ status: "error" }));
    return () => { alive = false; };
  }, [load, tick]);
  const state: Loaded<T> = done && done.load === load && done.tick === tick ? done.value : { status: "loading" };
  return [state, () => setTick((n) => n + 1)];
}

interface IngredientsProps {
  config: LabConfig;
  request: RunRequest;
  onModules: (keys: string[], on: boolean) => void;
}

export function Ingredients({ config, request, onModules }: IngredientsProps) {
  const { asOf, horizonDays } = request;
  const loadEvents = useCallback(() => api.events(asOf, horizonDays), [asOf, horizonDays]);
  const loadNews = useCallback(() => api.news(asOf, 7), [asOf]);
  const [events, retryEvents] = useLoaded(loadEvents);
  const [news, retryNews] = useLoaded(loadNews);
  const byGroup = (g: string) => config.modules.filter((m) => m.group === g);
  const anyOn = (mods: LabModule[]) => mods.some((m) => moduleState(request, m).on > 0);

  const cycleMods = byGroup("cycle");
  const cycleKeys = cycleMods.filter((m) => m.key !== "seas").map((m) => m.key);
  const cycleOn = anyOn(cycleMods.filter((m) => m.key !== "seas"));
  const seasonOn = anyOn(cycleMods.filter((m) => m.key === "seas"));
  const analog = config.modules.find((m) => m.group === "analog");

  return (
    <div className="flex flex-col gap-3">
      <IngredientSection
        n="①"
        title={t.cycle.title}
        hint={t.cycle.hint}
        summary={cycleSummary(events, cycleOn, seasonOn, retryEvents)}
        toggle={{ label: t.cycle.toggle, on: cycleOn, disabled: cycleKeys.length === 0, onChange: (on) => onModules(cycleKeys, on) }}
      >
        <EventsTable state={events} asOf={asOf} horizonDays={horizonDays} />
        <ModuleList title={t.cycle.title} mods={cycleMods} request={request} onModules={onModules} />
      </IngredientSection>
      <IngredientSection n="②" title={t.news.title} hint={t.news.hint} summary={newsSummary(news, retryNews)}>
        <NewsList state={news} asOf={asOf} days={7} />
      </IngredientSection>
      <IngredientSection
        n="③"
        title={t.impact.title}
        hint={t.impact.hint}
        summary={analog ? "" : t.impact.none}
        toggle={{ label: t.impact.toggle, on: analog ? moduleState(request, analog).on > 0 : false, disabled: !analog, onChange: (on) => analog && onModules([analog.key], on) }}
      >
        <p className="text-xs text-muted-foreground">{t.impact.off}</p>
        <ModuleList title={t.impact.groups.news} mods={byGroup("news")} request={request} onModules={onModules} />
        <ModuleList title={t.impact.groups.width} mods={byGroup("width")} request={request} onModules={onModules} />
        <ModuleList title={t.impact.groups.cut} mods={byGroup("cut")} request={request} onModules={onModules} />
      </IngredientSection>
    </div>
  );
}

interface IngredientSectionProps {
  n: string;
  title: string;
  hint: string;
  summary: ReactNode;
  toggle?: { label: string; on: boolean; disabled: boolean; onChange: (on: boolean) => void };
  children: ReactNode;
}

/** 원본 sj: 번호, 제목, 힌트, 요약, 토글, 자세히 */
function IngredientSection({ n, title, hint, summary, toggle, children }: IngredientSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <section className={cn("rounded-md border p-3", toggle && !toggle.on && "opacity-70")} aria-label={title}>
      <div className="flex items-start gap-2">
        <span className="num text-xs text-muted-foreground">{n}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <b className="text-sm">{title}</b>
            {toggle && (
              <Switch aria-label={toggle.label} checked={toggle.on} disabled={toggle.disabled} onCheckedChange={toggle.onChange} className="ml-auto" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{hint}</p>
          {/* 요약 자리는 실패하면 다시 시도 버튼까지 안는다. 접혀 있어도 늘 보이는 줄이다 */}
          <div className="mt-1 text-xs">{summary}</div>
        </div>
      </div>
      <Button variant="ghost" size="xs" className="mt-2" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? <ChevronDown /> : <ChevronRight />}
        {open ? t.collapse : t.expand}
      </Button>
      {open && <div className="mt-2 flex flex-col gap-3 border-t pt-3">{children}</div>}
    </section>
  );
}

/** 원본 uj */
function cycleSummary(events: Loaded<EventsResponse>, cycleOn: boolean, seasonOn: boolean, onRetry: () => void): ReactNode {
  const season = seasonOn ? t.cycle.seasonOn : t.cycle.seasonOff;
  if (!cycleOn) return t.cycle.off + (seasonOn ? t.cycle.seasonOnly : "");
  if (events.status === "loading") return t.cycle.counting;
  if (events.status === "error") return <Retry message={t.cycle.error} onRetry={onRetry} />;
  const known = events.data.known;
  if (known.length === 0) return `${t.cycle.none} · ${season}`;
  const counts = new Map<string, number>();
  for (const e of known) counts.set(e.eventType, (counts.get(e.eventType) ?? 0) + 1);
  const [topType] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const typeName = t.cycle.types[topType] ?? topType;
  return `${t.cycle.count(known.length)} · ${typeName}${counts.size > 1 ? t.cycle.etc : ""} · ${season}`;
}

/** 원본 ME */
function newsCounts(n: NewsResponse) {
  const judged = n.items.filter((i) => i.judgments.length > 0);
  const used = judged.filter((i) => i.used);
  const j = used.flatMap((i) => i.judgments);
  return {
    total: n.items.length, judged: judged.length, used: used.length, late: judged.length - used.length,
    market: j.filter((x) => x.sectorId === null).length, sector: j.filter((x) => x.sectorId !== null).length,
  };
}

/** 원본 dj */
function newsSummary(news: Loaded<NewsResponse>, onRetry: () => void): ReactNode {
  if (news.status === "loading") return t.news.reading;
  if (news.status === "error") return <Retry message={t.news.error} onRetry={onRetry} />;
  const c = newsCounts(news.data);
  if (c.judged === 0) return t.news.noJudgment(7, c.total);
  return `${label("판독")} ${t.news.summary(c.used, c.market, c.sector)}`;
}

function Retry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <p className="flex items-center gap-2 text-xs">
      <span>{message}</span>
      <Button variant="outline" size="xs" onClick={onRetry}>{strings.lab.retry}</Button>
    </p>
  );
}

function directionName(d: number | null): string {
  if (d === null) return t.cycle.direction.unknown;
  if (d > 0.2) return t.cycle.direction.up;
  if (d < -0.2) return t.cycle.direction.down;
  return t.cycle.direction.mixed;
}

function EventRow({ e }: { e: LabEvent }) {
  return (
    <tr className={cn(!e.used && "opacity-50")}>
      <td className="num pr-2">{e.eventDate.slice(5)}</td>
      <td className="pr-2">{e.subjectName}</td>
      <td className="pr-2">{t.cycle.types[e.eventType] ?? e.eventType}</td>
      <td className="pr-2">{e.note || NONE}{!e.used && <span className="text-muted-foreground">{t.cycle.lateNote}</span>}</td>
      <td className="pr-2 text-muted-foreground">{e.source}</td>
      <td className="num pr-2 text-muted-foreground">{e.knownAt}</td>
      <td className="pr-2">{e.used ? directionName(e.direction) : NONE}</td>
      <td className="num text-right">{e.used ? e.magnitude.toFixed(1) : NONE}</td>
    </tr>
  );
}

function EventsTable({ state, asOf, horizonDays }: { state: Loaded<EventsResponse>; asOf: string; horizonDays: number }) {
  if (state.status === "loading") return <p className="text-xs text-muted-foreground">{t.cycle.counting}</p>;
  /** 실패 줄과 다시 시도는 늘 보이는 요약 자리에 있다. 여기서는 되풀이하지 않는다 */
  if (state.status === "error") return <p className="text-xs text-muted-foreground">{t.cycle.error}</p>;
  const { known, unknown } = state.data;
  const read = known.filter((e) => e.direction !== null).length;
  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <b>{t.cycle.eventsTitle}</b>
        <span className="text-muted-foreground">{t.cycle.eventsHint(asOf, horizonLabel(horizonDays))}</span>
        <span className="num ml-auto">{t.cycle.eventsCount(known.length, read)}</span>
      </div>
      {known.length + unknown.length === 0 ? (
        <p className="text-muted-foreground">{t.cycle.eventsEmpty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead className="text-left text-muted-foreground">
              <tr>{t.cycle.columns.map((c) => <th key={c} className="pr-2 font-medium">{c}</th>)}</tr>
            </thead>
            <tbody>
              {known.map((e) => <EventRow key={e.id} e={e} />)}
              {unknown.map((e) => <EventRow key={e.id} e={e} />)}
            </tbody>
          </table>
        </div>
      )}
      {unknown.length > 0 && <p className="text-muted-foreground">{t.cycle.lateFoot(unknown.length)}</p>}
    </div>
  );
}

const STRENGTH = ["", "●○○", "●●○", "●●●"];
const DIR = (d: number) => (d > 0 ? "▲" : d < 0 ? "▼" : NONE);

function NewsRow({ it, asOf }: { it: NewsItem; asOf: string }) {
  const when = it.publishedAt.startsWith(asOf) ? it.publishedAt.slice(11, 16) : it.publishedAt.slice(5, 10);
  return (
    <li className={cn("flex flex-col gap-0.5 py-1.5", !it.used && "opacity-50")}>
      <span>{it.title}</span>
      <span className="flex flex-wrap gap-x-2 text-muted-foreground">
        <span>{it.source} · <span className="num">{when}</span></span>
        {it.judgments.map((j) => (
          <span key={j.id} className="num">
            {j.sectorName ?? t.news.market} {DIR(j.direction)} {STRENGTH[j.strength] ?? STRENGTH[1]} {t.news.decay(j.decayDays)}
          </span>
        ))}
      </span>
    </li>
  );
}

function NewsList({ state, asOf, days }: { state: Loaded<NewsResponse>; asOf: string; days: number }) {
  const [showAll, setShowAll] = useState(false);
  if (state.status === "loading") return <p className="text-xs text-muted-foreground">{t.news.reading}</p>;
  if (state.status === "error") return <p className="text-xs text-muted-foreground">{t.news.error}</p>;
  const c = newsCounts(state.data);
  const items = state.data.items.filter((i) => showAll || i.judgments.length > 0);
  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex flex-wrap items-center gap-x-2">
        <span className="num">{t.news.header(asOf, days, c.total, c.judged)}{c.late > 0 ? t.news.late(c.late) : ""}</span>
        <span className="text-muted-foreground">{state.data.judgeModel ? `${t.news.model} ${state.data.judgeModel}` : t.news.humanOnly}</span>
        {c.total > c.judged && (
          <Button variant="ghost" size="xs" className="ml-auto" aria-pressed={showAll} onClick={() => setShowAll((s) => !s)}>
            {showAll ? t.news.hideUnjudged : t.news.showUnjudged(c.total - c.judged)}
          </Button>
        )}
      </div>
      {c.total === 0 && <p className="text-muted-foreground">{t.news.empty}</p>}
      <ol className="divide-y">{items.map((it) => <NewsRow key={it.id} it={it} asOf={asOf} />)}</ol>
      {c.late > 0 && <p className="text-muted-foreground">{t.news.lateFoot}</p>}
    </div>
  );
}

function ModuleList({ title, mods, request, onModules }: { title: string; mods: LabModule[]; request: RunRequest; onModules: (keys: string[], on: boolean) => void }) {
  if (mods.length === 0) return null;
  const layers = (m: LabModule) => roundsOf(m).map((r) => t.layers[r]).join("·");
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground">{t.group(title)}</p>
      <ul className="flex flex-col gap-2">
        {mods.map((m) => {
          const st = moduleState(request, m);
          const usable = m.implemented && (m.dataStart === null || m.dataStart <= request.asOf);
          const reason = !m.implemented ? t.notImplemented : !usable ? t.unavailableFrom(m.dataStart) : null;
          return (
            <li key={m.key} className={cn("flex items-start gap-2 text-xs", (!usable || st.on === 0) && "opacity-70")}>
              <Switch aria-label={m.name} checked={st.on > 0} disabled={!usable} onCheckedChange={(on) => onModules([m.key], on)} className="mt-0.5" />
              <span className="flex min-w-0 flex-col">
                <span>
                  {m.name}
                  <span className="num ml-1 text-muted-foreground">{layers(m)} · {t.branch[m.branch]}{st.on > 0 && st.on < st.of ? ` · ${t.partial}` : ""}</span>
                </span>
                <span className="text-muted-foreground">{reason ?? m.description}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
