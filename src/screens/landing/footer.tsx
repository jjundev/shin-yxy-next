import { Link } from "react-router";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";

/** F. 상위 스펙 6장의 "아래에 데모 표시와 실험실, 저장소 링크" */
export function LandingFooter() {
  return (
    <footer className="border-t px-4 py-12">
      <div className="mx-auto flex max-w-wide flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
        <p className="text-muted-foreground break-keep">{landing.footer.note}</p>
        <nav aria-label={strings.nav.mainMenu} className="flex gap-4">
          <Link to="/lab" className="text-muted-foreground hover:text-foreground">{strings.nav.lab}</Link>
          <Link to="/saved" className="text-muted-foreground hover:text-foreground">{strings.nav.saved}</Link>
        </nav>
      </div>
    </footer>
  );
}
