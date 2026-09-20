import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router";
import { useSession } from "@/app/session";
import { BackdropVideo } from "@/components/landing/backdrop-video";
import { LayerStack } from "@/components/landing/layer-stack";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import type { RunResult } from "@/demo/types";
import { Button } from "@/design/ui/button";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { stackLayers } from "./layers";

/** S1. 약속 문장과 부제는 strings.landing 그대로 — 페이지에 한 번만 나온다.
 *  뒤의 세 층은 아래 S6 에서 설명되는 바로 그 오브젝트다 */
export function Hero({ result }: { result: RunResult | null }) {
  const { user } = useSession();
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, { span: "cover" });
  const layers = result ? stackLayers(result, landing.hero.marketName) : [];

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-4 py-24"
    >
      {/* 글 영역에서 배경을 마스크로 깎는다. 실측(영상 192프레임 표본 20장):
          이 조합에서 흐린 글(#667085) 최악 대비가 4.78:1 로 4.5:1 을 넘는다.
          마스크 없이 opacity-50 이면 4.44:1 로 못 미친다 */}
      <BackdropVideo
        name="hero-motion"
        className="hero-wash pointer-events-none absolute inset-0 -z-10 opacity-60"
      />
      <div className="mx-auto grid w-full max-w-wide items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        <div className="flex max-w-content flex-col gap-6">
          <p className="rise text-sm font-medium text-muted-foreground">{strings.appName}</p>
          <h1 className="rise text-3xl leading-snug font-semibold break-keep md:text-5xl">
            {strings.landing.promise}
          </h1>
          <p className="rise text-lg break-keep text-muted-foreground md:text-xl">
            {strings.landing.sub}
          </p>
          <div className="rise flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link to={user ? "/lab" : "/login"}>
                {user ? strings.landing.toLab : strings.landing.start}
              </Link>
            </Button>
            <span className="rounded-md border border-amber-500/60 bg-amber-50 px-2 py-0.5 text-xs whitespace-nowrap text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {strings.demoBadge}
            </span>
          </div>
        </div>
        {layers.length > 0 && <LayerStack layers={layers} label={landing.hero.stackLabel} gap={110} />}
      </div>
      <p
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-1 text-xs text-muted-foreground"
      >
        <span>{landing.scrollHint}</span>
        <ArrowDown className="size-4 animate-bounce" />
      </p>
    </section>
  );
}
