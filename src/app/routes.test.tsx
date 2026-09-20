import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider } from "react-router";
import { toast } from "sonner";
import { createAppRouter } from "./routes";
import { SessionProvider } from "./session";
import { ThemeProvider } from "./theme";
import { setOnboarded } from "@/app/onboarded";
import { strings } from "@/content/strings";
import { resetSaved } from "@/demo/saved";

// 토스트는 DOM 포털이라 화면에서 잡기 어렵다. 호출만 확인한다.
vi.mock("sonner", () => ({ toast: vi.fn() }));

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
  setOnboarded();
  resetSaved();
  vi.mocked(toast).mockClear();
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
    expect(await screen.findByText(strings.lab.emptyResult)).toBeInTheDocument();
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
    expect(toast).toHaveBeenCalledWith(strings.toast.unknownRoute, { id: "unknown-route" });
  });

  it("상단 바에 두 링크와 데모 표시가 있다", () => {
    localStorage.setItem("shin.session", "demo");
    mount("/lab");
    expect(screen.getAllByRole("link", { name: strings.nav.saved }).length).toBeGreaterThan(0);
    expect(screen.getByText(strings.demoBadge)).toBeInTheDocument();
  });

  it("데모 표시는 키보드로 짚을 수 있다", async () => {
    localStorage.setItem("shin.session", "demo");
    mount("/lab");
    // 상단 바의 앞 링크 셋을 지나면 데모 표시에 닿는다
    for (let i = 0; i < 4; i += 1) await userEvent.tab();
    expect(screen.getByText(strings.demoBadge)).toHaveFocus();
  });

  it("메뉴 첫 실험 다시 보기는 플래그를 지우고 안내로 연다", async () => {
    localStorage.setItem("shin.session", "demo");
    Element.prototype.hasPointerCapture ??= () => false;
    Element.prototype.scrollIntoView ??= () => {};
    mount("/lab");
    await screen.findByText(strings.lab.emptyResult);
    // 메뉴는 키보드로 연다. jsdom 에서 userEvent 의 클릭은 이 파일의 앞 테스트가 userEvent 를
    // 쓴 뒤라면 Radix 트리거의 첫 pointerdown 을 삼킨다. Enter 는 같은 경로를 안정적으로 탄다
    const trigger = screen.getByRole("button", { name: "메뉴" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(await screen.findByRole("menuitem", { name: strings.menu.replayOnboarding }));
    expect(await screen.findByRole("navigation", { name: strings.lab.guide.title })).toBeInTheDocument();
    expect(localStorage.getItem("shin.onboarded")).toBeNull();
  });
});
