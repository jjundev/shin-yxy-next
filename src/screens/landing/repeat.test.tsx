import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { strings } from "@/content/strings";
import { SEED_ASOFS } from "@/demo/saved";
import { Repeat } from "./repeat";

describe("Repeat", () => {
  it("저장소 시드 세 건을 카드로 그린다", async () => {
    render(<Repeat />);
    const deck = await screen.findByRole("list", { name: strings.saved.title });
    expect(within(deck).getAllByRole("listitem")).toHaveLength(3);
  });

  it("가장 최근 시드의 기준 시점이 보인다", async () => {
    render(<Repeat />);
    const deck = await screen.findByRole("list", { name: strings.saved.title });
    expect(deck).toHaveTextContent("2025-10-15");
    expect(SEED_ASOFS[0]).toBe("2025-10-15");
  });

  it("데크 카드는 --k 를 갖는다 — 뒤 카드일수록 크다", async () => {
    render(<Repeat />);
    const deck = await screen.findByRole("list", { name: strings.saved.title });
    const ks = [...deck.querySelectorAll<HTMLElement>(".deck-card")].map((el) =>
      el.style.getPropertyValue("--k"),
    );
    expect(ks).toEqual(["2", "1", "0"]);
  });

  it("스크럽 섹션이다 — sticky 무대를 갖는다", () => {
    const { container } = render(<Repeat />);
    expect(container.querySelector('[data-slot="scrub-stage"]')).not.toBeNull();
  });
});
