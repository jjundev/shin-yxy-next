import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSession } from "@/app/session";
import { ThemeToggle } from "@/app/theme-toggle";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import { Button } from "@/design/ui/button";
import { cn } from "@/lib/utils";

/** 랜딩 전용 헤더. AppShell 의 TopBar 를 쓰지 않는다(상위 스펙 3.2 — 랜딩은 독립 레이아웃).
 *  120px 를 지나면 나타난다. 상태는 한 번만 바뀌므로 프레임마다 쓰는 --p 를 쓰지 않는다 */
export function LandingHeader() {
  const { user } = useSession();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b bg-background/85 backdrop-blur-md transition-opacity duration-300",
        shown ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="mx-auto flex h-14 max-w-wide items-center gap-4 px-4">
        <Link to="/" className="font-semibold">{strings.appName}</Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to={user ? "/lab" : "/login"}>
              {user ? landing.header.toLab : landing.header.start}
            </Link>
          </Button>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="progress-bar h-0.5 origin-left bg-primary"
      />
    </header>
  );
}
