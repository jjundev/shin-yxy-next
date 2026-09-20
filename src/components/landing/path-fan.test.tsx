import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixedResult } from "@/test/fixture";
import { PathFan } from "./path-fan";

/** 필수소비재. acceptRate 0.7237 */
function sector() {
  return fixedResult().paths.subjects.find((s) => s.round === 1 && s.name === "필수소비재")!;
}

describe("PathFan", () => {
  it("그림 하나에 한 줄 설명", () => {
    render(<PathFan subject={sector()} label="굴린 길" counterLabel="굴린 횟수" />);
    expect(screen.getByRole("img", { name: "굴린 길" })).toBeInTheDocument();
  });

  it("보이는 줄은 표본 24개다", () => {
    const { container } = render(<PathFan subject={sector()} label="굴린 길" counterLabel="횟수" />);
    expect(container.querySelectorAll("[data-kind]")).toHaveLength(24);
  });

  it("떨어지는 줄 수는 acceptRate 를 24개에 맞춘 비율이다", () => {
    const s = sector();
    const expected = Math.round(24 * (1 - (s.acceptRate ?? 1))); // 0.7237 → 7
    const { container } = render(<PathFan subject={s} label="굴린 길" counterLabel="횟수" />);
    expect(container.querySelectorAll('[data-kind="dropped"]')).toHaveLength(expected);
    expect(container.querySelectorAll('[data-kind="kept"]')).toHaveLength(24 - expected);
  });

  it("어느 줄이 떨어지는지는 결정적이다 — 뒤에서부터", () => {
    const { container } = render(<PathFan subject={sector()} label="굴린 길" counterLabel="횟수" />);
    const kinds = [...container.querySelectorAll("[data-kind]")].map((el) => el.getAttribute("data-kind"));
    const firstDrop = kinds.indexOf("dropped");
    expect(kinds.slice(firstDrop).every((k) => k === "dropped")).toBe(true);
  });

  it("maxPaths 로 좁은 화면에서 줄 수를 줄인다", () => {
    const { container } = render(<PathFan subject={sector()} label="굴린 길" counterLabel="횟수" maxPaths={12} />);
    expect(container.querySelectorAll("[data-kind]")).toHaveLength(12);
  });

  it("관찰이 없으면(jsdom) 카운터가 최종값 4,000 을 보인다", () => {
    render(<PathFan subject={sector()} label="굴린 길" counterLabel="굴린 횟수" />);
    expect(screen.getByText("4,000")).toBeInTheDocument();
  });
});
