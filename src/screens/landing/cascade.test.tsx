import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { landing } from "@/content/landing";
import { fixedResult } from "@/test/fixture";
import { Cascade } from "./cascade";
import { stackLayers } from "./layers";

const t = landing.cascade;

describe("Cascade", () => {
  it("세 층이 t.layers 이름으로 갈아 끼워진 하나의 그림이다", () => {
    render(<Cascade result={fixedResult()} />);
    expect(screen.getByRole("img", { name: t.layers.join(" · ") })).toBeInTheDocument();
    for (const name of t.layers) {
      expect(document.querySelector(`[data-layer="${name}"]`)).not.toBeNull();
    }
  });

  it("층 사이로 답이 떨어지는 점이 둘이다", () => {
    const { container } = render(<Cascade result={fixedResult()} />);
    expect(container.querySelectorAll(".stack-drop")).toHaveLength(2);
  });

  it("층의 데이터는 stackLayers 가 고른 것 그대로다 — 이름만 바꾼다", () => {
    const picked = stackLayers(fixedResult(), t.layers[0]);
    expect(picked).toHaveLength(3);
    render(<Cascade result={fixedResult()} />);
    // 1등 종목 층은 뽑은 업종의 rows 를 거쳐 온다. round 2 배열 첫 줄이 아니다
    const leader = document.querySelector<HTMLElement>(`[data-layer="${t.layers[2]}"]`)!;
    expect(leader.style.getPropertyValue("--z")).toBe("0");
    expect(picked[2].subject.round).toBe(2);
  });

  it("결과가 없으면 그림 없이 꼬리만 남는다", () => {
    const { container } = render(<Cascade result={null} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("#cascade")).not.toBeNull();
    expect(screen.getByText(t.foot)).toBeInTheDocument();
  });
});
