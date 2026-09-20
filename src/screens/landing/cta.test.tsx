import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SessionProvider } from "@/app/session";
import { landing } from "@/content/landing";
import type { RunResult } from "@/demo/types";
import { fixedResult } from "@/test/fixture";
import { Cta } from "./cta";

function mount(result: RunResult | null = fixedResult()) {
  render(
    <SessionProvider>
      <MemoryRouter>
        <Cta result={result} />
      </MemoryRouter>
    </SessionProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
});

describe("Cta", () => {
  it("로그아웃이면 /login 으로 간다", () => {
    mount();
    expect(screen.getByRole("link", { name: landing.cta.start })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("link", { name: landing.cta.toLab })).toBeNull();
  });

  it("로그인 상태면 /lab 으로 간다", () => {
    localStorage.setItem("shin.session", "demo");
    mount();
    expect(screen.getByRole("link", { name: landing.cta.toLab })).toHaveAttribute("href", "/lab");
    expect(screen.queryByRole("link", { name: landing.cta.start })).toBeNull();
  });

  it("세 층 그림의 이름은 히어로의 것과 다르다", () => {
    mount();
    expect(screen.getByRole("img", { name: landing.cta.stackLabel })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: landing.hero.stackLabel })).toBeNull();
  });

  it("결과가 없으면 그림 없이 글과 버튼만 남는다", () => {
    mount(null);
    expect(screen.queryByRole("img", { name: landing.cta.stackLabel })).toBeNull();
    expect(screen.getByRole("link", { name: landing.cta.start })).toBeInTheDocument();
  });
});
