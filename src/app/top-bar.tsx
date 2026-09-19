import { Moon, Sun, Monitor, MoreHorizontal } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { Button } from "@/design/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/design/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/design/ui/tooltip";
import { strings } from "@/content/strings";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "./theme";

const THEME_ORDER: Theme[] = ["light", "dark", "system"];

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  function cycleTheme() {
    setTheme(THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]);
  }

  function replayOnboarding() {
    localStorage.removeItem("shin.onboarded");
    navigate("/lab");
  }

  const link = ({ isActive }: { isActive: boolean }) =>
    cn("text-sm text-muted-foreground hover:text-foreground", isActive && "text-foreground font-medium");

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-wide items-center gap-6 px-4">
        <NavLink to="/" className="font-semibold">{strings.appName}</NavLink>
        <nav className="hidden gap-4 md:flex">
          <NavLink to="/lab" className={link}>{strings.nav.lab}</NavLink>
          <NavLink to="/saved" className={link}>{strings.nav.saved}</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="rounded-md border border-amber-500/60 bg-amber-50 px-2 py-0.5 text-xs whitespace-nowrap text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                tabIndex={0}
                role="note"
              >
                {strings.demoBadge}
              </span>
            </TooltipTrigger>
            <TooltipContent>{strings.demoBadgeHint}</TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon" aria-label={strings.theme[theme]} onClick={cycleTheme}>
            <Icon className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="메뉴"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={replayOnboarding}>{strings.menu.replayOnboarding}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
