import { Link } from "react-router";
import { Button } from "@/design/ui/button";
import { strings } from "@/content/strings";
import { useSession } from "@/app/session";

export function LandingScreen() {
  const { user } = useSession();
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center gap-6 px-4 py-16">
      <p className="text-sm font-medium text-muted-foreground">{strings.appName}</p>
      <h1 className="text-3xl font-semibold leading-snug break-keep">{strings.landing.promise}</h1>
      <p className="text-lg text-muted-foreground break-keep">{strings.landing.sub}</p>
      <div>
        <Button asChild size="lg">
          <Link to={user ? "/lab" : "/login"}>{user ? strings.landing.toLab : strings.landing.start}</Link>
        </Button>
      </div>
    </main>
  );
}
