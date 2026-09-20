import { useRef } from "react";
import { landing } from "@/content/landing";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { Contrast } from "./contrast";
import { useFixedRun } from "./fixed-run";
import { Hero } from "./hero";
import { Moment } from "./moment";
import { LandingFooter } from "./footer";
import { LandingHeader } from "./header";
import "./landing.css";

/** 상위 스펙 6장 + 4단계 설계. 고정 시드는 여기서 한 번만 돌려 섹션들에 나눠 준다 */
export function LandingScreen() {
  const root = useRef<HTMLDivElement>(null);
  const { run } = useFixedRun();
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
        <Moment result={result} />
      </main>
      <LandingFooter />
    </div>
  );
}
