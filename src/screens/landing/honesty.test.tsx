import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import { fixedResult } from "@/test/fixture";
import { Honesty } from "./honesty";

const t = landing.honesty;

beforeEach(() => {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

function box() {
  return screen.getByRole("group", { name: t.title });
}

describe("Honesty", () => {
  it("뽑았는데 방향이 틀린 업종 하나를 크게 건다 — 고정 시드에서는 의료", () => {
    render(<Honesty result={fixedResult()} />);
    expect(box()).toHaveTextContent("의료");
    expect(box()).toHaveTextContent(strings.subjectVerdict.FAIL);
  });

  it("예상과 실제가 나란히 보인다", () => {
    render(<Honesty result={fixedResult()} />);
    expect(within(box()).getByText(t.predicted)).toBeInTheDocument();
    expect(within(box()).getAllByText(/\+[0-9.]*%/).length).toBeGreaterThanOrEqual(1);
    expect(within(box()).getAllByText(/[−-][0-9.]*%/).length).toBeGreaterThanOrEqual(1);
  });

  it("색만으로 말하지 않는다 — 배지에 판정 텍스트가 같이 들어간다", () => {
    render(<Honesty result={fixedResult()} />);
    expect(within(box()).getByText(strings.subjectVerdict.FAIL)).toBeInTheDocument();
    expect(within(box()).getByText(t.predicted)).toBeInTheDocument();
  });

  it("무엇이 밀었는지 재료를 최대 셋 적는다", () => {
    render(<Honesty result={fixedResult()} />);
    expect(within(box()).getByText(t.pushed)).toBeInTheDocument();
    expect(within(box()).getAllByRole("listitem").length).toBeLessThanOrEqual(3);
  });

  it("결과가 없으면 큰 틀을 걸지 않는다", () => {
    render(<Honesty result={null} />);
    expect(screen.queryByRole("group", { name: t.title })).not.toBeInTheDocument();
    expect(screen.getByText(t.title)).toBeInTheDocument();
  });
});
