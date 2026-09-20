import type { CSSProperties } from "react";
import { AssetSlot } from "@/components/landing/asset-slot";
import { landing } from "@/content/landing";
import { LandingSection } from "./section";

const t = landing.preview;

/** S10. 기울어져 있던 화면이 스크롤과 함께 정면으로 펴진다 */
export function Preview() {
  return (
    <LandingSection id="preview" title={t.title} lead={t.body} scrub>
      <div className="tilt">
        <div className="tilt-inner">
          <AssetSlot id="lab-full" alt={t.imageAlt} ratio="16/10" className="shadow-2xl" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <AssetSlot id="lab-mobile" alt={t.imageMobileAlt} ratio="9/16" />
        <dl className="flex flex-col gap-5">
          {t.hotspots.map((h, i) => (
            <div key={h.name} className="rise flex flex-col gap-1" style={{ "--d": 0.15 * i } as CSSProperties}>
              <dt className="text-base font-medium">{h.name}</dt>
              <dd className="text-sm break-keep text-muted-foreground">{h.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </LandingSection>
  );
}
