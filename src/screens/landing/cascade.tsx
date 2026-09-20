import { LayerStack } from "@/components/landing/layer-stack";
import { landing } from "@/content/landing";
import type { RunResult } from "@/demo/types";
import { LandingSection } from "./section";
import { stackLayers } from "./layers";

const t = landing.cascade;

/** S6. 히어로 뒤에 있던 세 장이 무엇이었는지 여기서 밝힌다.
 *  층 이름만 갈아 끼운다 — 그림은 같은 컴포넌트, 같은 데이터다.
 *  층을 고르는 일은 stackLayers 가 한다. round 2 를 배열 순서로 짝지으면 안 된다 —
 *  첫 선정 업종은 필수소비재인데 첫 선정 1등 종목은 의료의 삼성바이오로직스다(실측).
 *  rows 의 sectorId → instrumentId 를 거쳐야 KT&G 가 나온다 */
export function Cascade({ result }: { result: RunResult | null }) {
  const base = result ? stackLayers(result, t.layers[0]) : [];
  const layers = base.map((l, i) => ({ ...l, name: t.layers[i] }));

  return (
    <LandingSection id="cascade" title={t.title} lead={t.lead} scrub>
      {layers.length > 0 && (
        <LayerStack layers={layers} label={t.layers.join(" · ")} gap={130} showDrops />
      )}
      <p className="mx-auto max-w-content text-sm break-keep text-muted-foreground">{t.foot}</p>
    </LandingSection>
  );
}
