import { FlaskConical, List } from "lucide-react";
import { NavLink } from "react-router";
import { strings } from "@/content/strings";
import { cn } from "@/lib/utils";

export function BottomTabs() {
  const tab = ({ isActive }: { isActive: boolean }) =>
    cn("flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground", isActive && "text-primary");
  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t bg-background md:hidden" aria-label="하단 탭">
      <NavLink to="/lab" className={tab}><FlaskConical className="size-5" />{strings.nav.lab}</NavLink>
      <NavLink to="/saved" className={tab}><List className="size-5" />{strings.nav.saved}</NavLink>
    </nav>
  );
}
