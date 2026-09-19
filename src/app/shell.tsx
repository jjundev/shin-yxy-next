import { Outlet } from "react-router";
import { TooltipProvider } from "@/design/ui/tooltip";
import { BottomTabs } from "./bottom-tabs";
import { TopBar } from "./top-bar";

export function AppShell() {
  return (
    <TooltipProvider>
      <div className="min-h-dvh pb-16 md:pb-0">
        <TopBar />
        <main className="mx-auto max-w-wide px-4 py-6">
          <Outlet />
        </main>
        <BottomTabs />
      </div>
    </TooltipProvider>
  );
}
