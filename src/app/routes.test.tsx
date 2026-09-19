import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider } from "react-router";
import { createAppRouter } from "./routes";
import { SessionProvider } from "./session";
import { ThemeProvider } from "./theme";
import { strings } from "@/content/strings";
import { resetSaved } from "@/demo/saved";

function mount(path: string) {
  const router = createAppRouter([path]);
  render(
    <ThemeProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </ThemeProvider>,
  );
  return router;
}

beforeEach(() => {
  localStorage.clear();
  resetSaved();
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  }));
});

describe("routes", () => {
  it("랜딩은 약속 문장과 시작 버튼", () => {
    mount("/");
    expect(screen.getByText(strings.landing.promise)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: strings.landing.start })).toHaveAttribute("href", "/login");
  });

  it("로그인 버튼을 누르면 실험실로 간다", async () => {
    const router = mount("/login");
    await userEvent.click(screen.getByRole("button", { name: strings.login.enter }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/lab"));
    expect(screen.getByText(strings.lab.emptyResult)).toBeInTheDocument();
  });

  it("저장소는 시드 셋을 보여준다", async () => {
    localStorage.setItem("shin.session", "demo");
    mount("/saved");
    await waitFor(() => expect(screen.getAllByRole("button", { name: strings.saved.open })).toHaveLength(3));
    expect(screen.getByText("2025-10-15")).toBeInTheDocument();
  });

  it("없는 경로는 실험실로 보낸다", async () => {
    localStorage.setItem("shin.session", "demo");
    const router = mount("/admin/users");
    await waitFor(() => expect(router.state.location.pathname).toBe("/lab"));
  });

  it("상단 바에 두 링크와 데모 표시가 있다", () => {
    localStorage.setItem("shin.session", "demo");
    mount("/lab");
    expect(screen.getAllByRole("link", { name: strings.nav.saved }).length).toBeGreaterThan(0);
    expect(screen.getByText(strings.demoBadge)).toBeInTheDocument();
  });
});
