import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { landing } from "@/content/landing";
import { fixedResult } from "@/test/fixture";
import { Roll } from "./roll";

beforeEach(() => {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  }));
});

describe("Roll", () => {
  it("굴림 팬이 뜨고 카운터가 최종값 4,000 을 보인다", () => {
    render(<Roll result={fixedResult()} />);
    expect(screen.getByRole("img", { name: landing.roll.title })).toBeInTheDocument();
    expect(screen.getByText("4,000")).toBeInTheDocument();
    expect(screen.getByText(landing.roll.counterLabel)).toBeInTheDocument();
  });

  it("보이는 선이 전부가 아님을 밝힌다", () => {
    render(<Roll result={fixedResult()} />);
    expect(screen.getByText(landing.roll.honest)).toBeInTheDocument();
  });

  it("체를 통과한 비율과, 그림의 줄 수가 비율임을 밝힌다", () => {
    const r = fixedResult();
    const s = r.paths.subjects.find((x) => x.round === 1 && x.selected)!;
    const rate = s.acceptRate ?? 1;
    const shown = s.samples.length;
    const dropped = Math.round(shown * (1 - rate));
    render(<Roll result={r} />);
    expect(
      screen.getByText(landing.roll.accept(`${Math.round(rate * 100)}%`, dropped, shown)),
    ).toBeInTheDocument();
  });

  it("스크럽 섹션이다 — sticky 무대가 있고 제목은 .rise 를 안 쓴다", () => {
    const { container } = render(<Roll result={fixedResult()} />);
    expect(container.querySelector('[data-slot="scrub-stage"]')).not.toBeNull();
    expect(screen.getByRole("heading", { name: landing.roll.title, level: 2 })).not.toHaveClass("rise");
  });

  it("결과가 없으면 제목과 리드만 두고 그림은 안 그린다", () => {
    render(<Roll result={null} />);
    expect(screen.getByRole("heading", { name: landing.roll.title, level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: landing.roll.title })).toBeNull();
  });
});
