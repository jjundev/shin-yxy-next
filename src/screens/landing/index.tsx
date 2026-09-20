import { useRef } from "react";
import { landing } from "@/content/landing";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { Band } from "./band";
import { Cascade } from "./cascade";
import { Contrast } from "./contrast";
import { Cta } from "./cta";
import { Evidence } from "./evidence";
import { useFixedRun } from "./fixed-run";
import { Gather } from "./gather";
import { Hero } from "./hero";
import { Honesty } from "./honesty";
import { Limits } from "./limits";
import { Moment } from "./moment";
import { Preview } from "./preview";
import { Repeat } from "./repeat";
import { Roll } from "./roll";
import { Tunnel } from "./tunnel";
import { LandingFooter } from "./footer";
import { LandingHeader } from "./header";
import "./landing.css";

/** 상위 스펙 6장 + 4단계 설계. 고정 시드는 여기서 한 번만 돌려 섹션들에 나눠 준다.
 *  섹션 순서가 곧 서사다: 약속 → 대조 → 과거로 → 두 시점 → 모은다 → 굴린다 →
 *  층 → 남는다 → 증거 → 정직 → 미리보기 → 반복 → 경계 → 시작 */
export function LandingScreen() {
  const root = useRef<HTMLDivElement>(null);
  const { run, retry } = useFixedRun();
  // 루트는 --p 를 쓰면 안 된다. 커스텀 프로퍼티는 상속되므로 섹션 밖에 있는
  // 히어로가 이 값을 물려받아 통째로 투명해진다 (실측으로 확인한 결함)
  useScrollProgress(root, { span: "cover", rest: 0, varName: "--page-p" });
  const result = run.status === "ok" ? run.result : null;

  return (
    <div ref={root} className="landing-root">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
      >
        {landing.skipToContent}
      </a>
      <LandingHeader />
      <main id="main">
        <Hero result={result} />
        <Contrast result={result} />
        <Tunnel />
        <Moment result={result} />
        <Gather />
        <Roll result={result} />
        <Cascade result={result} />
        <Band result={result} />
        <Evidence result={result} error={run.status === "error"} onRetry={retry} />
        <Honesty result={result} />
        <Preview />
        <Repeat />
        <Limits />
        <Cta result={result} />
      </main>
      <LandingFooter />
    </div>
  );
}
