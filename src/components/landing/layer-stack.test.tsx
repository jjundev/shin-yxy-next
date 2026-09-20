import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixedResult } from "@/test/fixture";
import { LayerStack } from "./layer-stack";

function layers() {
  const r = fixedResult();
  const market = r.paths.subjects.find((s) => s.round === 0)!;
  const sector = r.paths.subjects.find((s) => s.round === 1 && s.selected)!;
  const leader = r.paths.subjects.find((s) => s.round === 2 && s.selected)!;
  return [
    { name: "시장", subject: market },
    { name: "업종", subject: sector },
    { name: "1등 종목", subject: leader },
  ];
}

describe("LayerStack", () => {
  it("그림 전체가 한 줄 설명을 가진 하나의 그림이다", () => {
    render(<LayerStack layers={layers()} label="세 층이 겹친 그림" />);
    expect(screen.getByRole("img", { name: "세 층이 겹친 그림" })).toBeInTheDocument();
  });

  it("층마다 이름과 예상값을 적는다", () => {
    render(<LayerStack layers={layers()} label="세 층" />);
    for (const name of ["시장", "업종", "1등 종목"]) {
      expect(document.querySelector(`[data-layer="${name}"]`)).not.toBeNull();
    }
  });

  it("깊이(--z)는 뒤로 갈수록 크고, 드러나는 순서(--o)는 시장이 먼저다", () => {
    render(<LayerStack layers={layers()} label="세 층" />);
    const market = document.querySelector<HTMLElement>('[data-layer="시장"]')!;
    const leader = document.querySelector<HTMLElement>('[data-layer="1등 종목"]')!;
    expect(market.style.getPropertyValue("--z")).toBe("2");
    expect(leader.style.getPropertyValue("--z")).toBe("0");
    expect(market.style.getPropertyValue("--o")).toBe("0");
    expect(leader.style.getPropertyValue("--o")).toBe("2");
  });

  it("showDrops 면 층 사이에 떨어지는 점이 생긴다 — 마지막 층 뒤에는 없다", () => {
    const { container } = render(<LayerStack layers={layers()} label="세 층" showDrops />);
    expect(container.querySelectorAll(".stack-drop")).toHaveLength(2);
  });

  it("showDrops 가 없으면 점이 없다", () => {
    const { container } = render(<LayerStack layers={layers()} label="세 층" />);
    expect(container.querySelectorAll(".stack-drop")).toHaveLength(0);
  });
});
