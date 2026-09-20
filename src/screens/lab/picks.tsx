import { strings } from "@/content/strings";
import { label } from "@/content/labels";
import type { RunResult } from "@/demo/types";
import { ToggleGroup, ToggleGroupItem } from "@/design/ui/toggle-group";
import { PathChart } from "@/components/path-chart";
import { RankList } from "@/components/rank-list";
import { sameFocus, type Focus } from "@/components/focus";
import { horizonLabel } from "@/lib/format";
import type { Layer, Mode } from "./state";

interface PicksProps {
  result: RunResult;
  layer: Layer;
  mode: Mode;
  focus: Focus | null;
  onLayer: (l: Layer) => void;
  onMode: (m: Mode) => void;
  onFocus: (f: Focus) => void;
}

const t = strings.lab.picks;

export function Picks({ result, layer, mode, focus, onLayer, onMode, onFocus }: PicksProps) {
  const subjects = result.paths.subjects.filter((s) => s.round === 0 || s.round === layer);
  const focused = subjects.find((s) => sameFocus({ round: s.round, subjectId: s.subjectId }, focus)) ?? subjects[0];
  const anyActual = subjects.some((s) => s.actual.length > 1);
  const count = (r: 1 | 2) => result.paths.subjects.filter((s) => s.round === r).length;
  return (
    <div className="flex flex-col gap-3">
      <p className="num text-xs text-muted-foreground">
        {t.header(result.asOf, horizonLabel(result.horizonDays), focused?.samples.length ?? 0)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup type="single" value={String(layer)} aria-label={t.layer} onValueChange={(v) => { if (v === "1" || v === "2") onLayer(Number(v) as Layer); }}>
          <ToggleGroupItem value="1">{t.layerSector(count(1))}</ToggleGroupItem>
          <ToggleGroupItem value="2" disabled={count(2) === 0}>{t.layerLeader(count(2))}</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" value={mode} aria-label={t.mode} onValueChange={(v) => { if (v === "actual" || v === "rolled") onMode(v); }}>
          <ToggleGroupItem value="actual" disabled={!anyActual}>{t.modeActual}</ToggleGroupItem>
          <ToggleGroupItem value="rolled">{`${label("굴린 길")} ${focused?.samples.length ?? 0}`}</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
        <PathChart dates={result.paths.dates} subjects={subjects} focus={focus} mode={mode} />
        <RankList subjects={subjects} focus={focus} onFocus={onFocus} />
      </div>
    </div>
  );
}
