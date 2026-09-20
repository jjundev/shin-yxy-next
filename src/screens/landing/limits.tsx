import { landing } from "@/content/landing";
import { LandingSection } from "./section";

const t = landing.limits;

/** S12. 이 섹션만 움직이지 않는다 — rest 1 로 고정하고 .rise 를 쓰지 않는다.
 *  열한 섹션 내리 움직인 뒤 여기서 멈춰야 읽힌다 */
export function Limits() {
  return (
    <LandingSection id="limits" title={t.title} rest={1} className="bg-muted/40">
      <ul className="mx-auto flex w-full max-w-content flex-col gap-4">
        {t.items.map((item) => (
          <li key={item} className="flex gap-3 text-base break-keep">
            <span aria-hidden="true" className="pt-2.5">
              <i className="block size-1.5 rounded-full bg-muted-foreground" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}
