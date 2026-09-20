import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import { Gather } from "./gather";

beforeEach(() => {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  }));
});

describe("Gather", () => {
  it("재료 세 카드는 실험실 문구를 그대로 쓴다", () => {
    render(<Gather />);
    expect(screen.getByText(strings.lab.what.cycle.hint)).toBeInTheDocument();
    expect(screen.getByText(strings.lab.what.news.hint)).toBeInTheDocument();
    expect(screen.getByText(strings.lab.what.impact.hint)).toBeInTheDocument();
  });

  it("기준일 뒤에 알려진 일정은 흐린 줄로 따로 보여 준다", async () => {
    render(<Gather />);
    const late = await screen.findByRole("table", { name: landing.gather.lateTitle });
    expect(late.querySelectorAll('tr[data-late="true"]').length).toBeGreaterThan(0);
    expect(late.querySelectorAll('tr[data-late="false"]').length).toBeGreaterThan(0);
  });

  it("흐린 줄에는 안 썼다는 딱지와 설명이 붙는다", async () => {
    render(<Gather />);
    await screen.findByRole("table", { name: landing.gather.lateTitle });
    expect(screen.getAllByText(landing.gather.lateBadge).length).toBeGreaterThan(0);
    expect(screen.getByText(landing.gather.lateBody)).toBeInTheDocument();
  });

  it("스크럽 섹션이 아니다 — 제목이 .rise 로 나타난다", () => {
    const { container } = render(<Gather />);
    expect(container.querySelector('[data-slot="scrub-stage"]')).toBeNull();
    expect(screen.getByRole("heading", { name: landing.gather.title, level: 2 })).toHaveClass("rise");
  });
});
