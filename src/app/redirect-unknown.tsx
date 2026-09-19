import { useEffect } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { strings } from "@/content/strings";

export function RedirectUnknown() {
  useEffect(() => {
    toast(strings.toast.unknownRoute, { id: "unknown-route" });
  }, []);
  return <Navigate to="/lab" replace />;
}
