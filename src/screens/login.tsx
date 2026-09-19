import { useLocation, useNavigate } from "react-router";
import { Button } from "@/design/ui/button";
import { strings } from "@/content/strings";
import { useSession } from "@/app/session";

export function LoginScreen() {
  const { signIn } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/lab";

  async function enter() {
    await signIn();
    navigate(from, { replace: true });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">{strings.login.title}</h1>
      <Button size="lg" onClick={enter}>{strings.login.enter}</Button>
    </main>
  );
}
