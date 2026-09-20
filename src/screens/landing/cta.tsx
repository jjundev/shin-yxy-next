import { Link } from "react-router";
import { useSession } from "@/app/session";
import { LayerStack } from "@/components/landing/layer-stack";
import { landing } from "@/content/landing";
import type { RunResult } from "@/demo/types";
import { Button } from "@/design/ui/button";
import { LandingSection } from "./section";
import { stackLayers } from "./layers";

const t = landing.cta;

/** S13. 히어로의 오브젝트가 완성된 모습으로 돌아온다 */
export function Cta({ result }: { result: RunResult | null }) {
  const { user } = useSession();
  const layers = result ? stackLayers(result, landing.hero.marketName) : [];

  return (
    <LandingSection id="start" title={t.title} lead={t.sub}>
      {layers.length > 0 && (
        <LayerStack layers={layers} label={t.stackLabel} gap={70} className="opacity-70" />
      )}
      <div className="mx-auto">
        <Button asChild size="lg">
          <Link to={user ? "/lab" : "/login"}>{user ? t.toLab : t.start}</Link>
        </Button>
      </div>
    </LandingSection>
  );
}
