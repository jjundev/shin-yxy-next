import { useRef } from "react";
import { landing } from "@/content/landing";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { useFixedRun } from "./fixed-run";
import { Hero } from "./hero";
import { LandingFooter } from "./footer";
import { LandingHeader } from "./header";
import "./landing.css";

/** 상위 스펙 6장 + 4단계 설계. 고정 시드는 여기서 한 번만 돌려 섹션들에 나눠 준다 */
export function LandingScreen() {
  const root = useRef<HTMLDivElement>(null);
  const { run } = useFixedRun();
  useScrollProgress(root, { span: "cover", rest: 0 });
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
      </main>
      <LandingFooter />
    </div>
  );
}
