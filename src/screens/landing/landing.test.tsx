import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { SessionProvider } from "@/app/session";
import { ThemeProvider } from "@/app/theme";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import { LandingScreen } from "./index";

function mount() {
  render(
    <ThemeProvider>
      <SessionProvider>
        <MemoryRouter>
          <LandingScreen />
        </MemoryRouter>
      </SessionProvider>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  }));
});

describe("LandingScreen", () => {
  it("약속 문장과 부제가 한 번씩 나온다", () => {
    mount();
    expect(screen.getByText(strings.landing.promise)).toBeInTheDocument();
    expect(screen.getByText(strings.landing.sub)).toBeInTheDocument();
  });

  it('"첫 실험 시작하기" 링크가 정확히 하나, /login 으로 간다', () => {
    mount();
    const links = screen.getAllByRole("link", { name: strings.landing.start });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/login");
  });

  it("헤더 CTA 는 이름이 달라 히어로 CTA 와 부딪히지 않는다", () => {
    mount();
    expect(screen.getByRole("link", { name: landing.header.start })).toBeInTheDocument();
  });

  it("로그인 상태면 히어로 CTA 가 실험실로 간다", () => {
    localStorage.setItem("shin.session", "demo");
    mount();
    const link = screen.getByRole("link", { name: strings.landing.toLab });
    expect(link).toHaveAttribute("href", "/lab");
  });

  it("히어로 배경은 장식 영상이고 접근성 트리에 없다", () => {
    mount();
    const v = document.querySelector('video[data-backdrop="hero-motion"]');
    expect(v).not.toBeNull();
    expect(v).toHaveAttribute("aria-hidden", "true");
    expect(v?.querySelectorAll("source")).toHaveLength(2);
  });

  it("고정 시드가 끝나면 세 층 그림이 나온다", async () => {
    mount();
    await waitFor(() =>
      expect(screen.getByRole("img", { name: landing.hero.stackLabel })).toBeInTheDocument(),
    );
  });

  it("푸터에 데모 표시와 두 링크가 있다", () => {
    mount();
    expect(screen.getByText(strings.demoBadge)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: strings.nav.lab })).toHaveAttribute("href", "/lab");
    expect(screen.getByRole("link", { name: strings.nav.saved })).toHaveAttribute("href", "/saved");
  });

  it("본문으로 건너뛰는 링크가 맨 앞에 있다", () => {
    mount();
    expect(screen.getByRole("link", { name: landing.skipToContent })).toHaveAttribute("href", "#main");
  });
});
