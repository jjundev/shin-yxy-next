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

  it("대조 섹션은 뽑은 업종의 예상과 실제를 나란히 놓는다", async () => {
    mount();
    const list = await screen.findByRole("list", { name: landing.contrast.ours });
    expect(list.querySelectorAll("li")).toHaveLength(3);
    expect(list).toHaveTextContent("필수소비재");
    expect(list).toHaveTextContent("의료");
    expect(list).toHaveTextContent("금융");
  });

  it("대조 섹션의 왼쪽은 가상 예측 앱 그림 자리다", () => {
    mount();
    expect(screen.getByRole("img", { name: landing.contrast.imageAlt })).toBeInTheDocument();
  });

  it("두 시점 섹션 리드는 안내 1단계 본문의 앞부분이다", () => {
    mount();
    expect(screen.getByText(landing.moment.lead)).toBeInTheDocument();
    // 실험실 조작 지시("왼쪽에서 …")는 랜딩에 옮기지 않는다
    expect(screen.queryByText(strings.lab.guide.steps[0].body)).toBeNull();
  });

  it("스크럽 섹션은 화면보다 높고 본문이 sticky 로 붙어 있다", () => {
    mount();
    const moment = document.getElementById("moment");
    expect(moment?.className).toContain("min-h-[180vh]");
    expect(moment?.querySelector('[data-slot="scrub-stage"]')?.className).toContain("sticky");
  });

  it("시간 터널은 스크럽 무대 위 그림 하나로 들어간다", () => {
    mount();
    const img = screen.getByRole("img", { name: landing.tunnel.label });
    expect(img).toHaveAttribute("src", expect.stringContaining("tunnel-"));
  });

  it("관찰이 없으면(jsdom) 터널이 마지막 프레임에서 멈춘다", () => {
    mount();
    // rest 1 → 036. 그 판이 S3 의 기준 시점으로 이어진다
    expect(screen.getByRole("img", { name: landing.tunnel.label }))
      .toHaveAttribute("src", "/landing-assets/time-tunnel/tunnel-036.webp");
  });

  it("두 시점 섹션의 숫자 셋", () => {
    mount();
    for (const s of landing.moment.stats) {
      expect(screen.getByText(s.name)).toBeInTheDocument();
    }
  });
});

describe("랜딩이 말하는 숫자가 설정과 맞는가", () => {
  it("고를 수 있는 기준 시점 개수", async () => {
    const { config } = await import("@/demo/generated/adapter");
    expect(String(config.asofChoices.length)).toBe(landing.moment.stats[0].value);
  });
});
