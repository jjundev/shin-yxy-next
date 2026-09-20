import { FlaskConical, List } from "lucide-react";
import { NavLink } from "react-router";
import { strings } from "@/content/strings";
import { cn } from "@/lib/utils";
import { useSavedCount } from "./saved-count";

export function BottomTabs() {
  const savedCount = useSavedCount();
  const tab = ({ isActive }: { isActive: boolean }) =>
    cn("flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground", isActive && "text-primary");
  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t bg-background md:hidden" aria-label={strings.nav.bottomTabs}>
      <NavLink to="/lab" className={tab}><FlaskConical className="size-5" />{strings.nav.lab}</NavLink>
      <NavLink to="/saved" className={tab}>
        <List className="size-5" />
        <span>
          {strings.nav.saved}
          {savedCount !== null && savedCount > 0 && (
            <span aria-hidden="true" className="num ml-0.5 rounded-sm bg-muted px-1">{savedCount}</span>
          )}
        </span>
      </NavLink>
    </nav>
  );
}
