import { render, screen, within } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider, createMemoryRouter } from "react-router";
import { api } from "@/api/client";
import { resetSaved } from "@/demo/saved";
import { setRunDelay } from "@/demo/adapter";
import { TooltipProvider } from "@/design/ui/tooltip";
import { BottomTabs } from "./bottom-tabs";
import { ThemeProvider } from "./theme";
import { TopBar } from "./top-bar";

setRunDelay(() => 0);

function mount() {
  const router = createMemoryRouter(
    [{
      path: "/",
      element: <TooltipProvider><TopBar /><BottomTabs /></TooltipProvider>,
    }],
    { initialEntries: ["/"] },
  );
  render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  resetSaved();
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  }));
});

describe("저장 개수 배지", () => {
  it("상단 링크와 하단 탭에 시드 개수 3이 붙고, 저장하면 4가 된다", async () => {
    mount();
    const links = await screen.findAllByRole("link", { name: "저장소" });
    expect(links).toHaveLength(2);
    for (const l of links) expect(within(l).getByText("3")).toBeInTheDocument();
    await act(async () => {
      const req = api.defaultRequest();
      await api.save(req, await api.run(req));
    });
    for (const l of links) expect(await within(l).findByText("4")).toBeInTheDocument();
  });
});
