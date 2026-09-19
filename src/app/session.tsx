import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { api } from "@/api/client";
import type { DemoUser } from "@/demo/types";

const KEY = "shin.session";

interface SessionContextValue {
  user: DemoUser | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() =>
    localStorage.getItem(KEY) === "demo" ? { id: 0, loginId: "demo", name: "데모", roles: ["USER"] } : null,
  );

  const signIn = useCallback(async () => {
    const { user } = await api.login();
    localStorage.setItem(KEY, "demo");
    setUser(user);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
