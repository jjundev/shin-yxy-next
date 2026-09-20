import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { landing } from "@/content/landing";
import { REMAIN_BODY } from "@/content/why";
import { fixedResult } from "@/test/fixture";
import { Band } from "./band";

const t = landing.band;

describe("Band", () => {
  it("뽑은 업종 셋의 80% 범위 막대를 보여 준다", () => {
    render(<Band result={fixedResult()} />);
    const list = screen.getByRole("list", { name: t.legend });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    const picked = fixedResult().paths.subjects.filter((s) => s.round === 1 && s.selected);
    for (const s of picked) expect(within(list).getByText(s.name)).toBeInTheDocument();
  });

  it("리드는 왜? 패널의 3단계 문장이다", () => {
    render(<Band result={fixedResult()} />);
    expect(screen.getByText(REMAIN_BODY)).toBeInTheDocument();
  });

  it("막대마다 --d 가 <li> 에 직접 걸려 순서대로 올라온다", () => {
    const { container } = render(<Band result={fixedResult()} />);
    const items = [...container.querySelectorAll<HTMLElement>("li.rise")];
    expect(items).toHaveLength(3);
    expect(items.map((li) => li.style.getPropertyValue("--d"))).toEqual(["0", "0.15", "0.3"]);
  });

  it("결과가 없으면 목록 없이 꼬리만 남는다", () => {
    const { container } = render(<Band result={null} />);
    expect(screen.queryByRole("list")).toBeNull();
    expect(container.querySelector("#band")).not.toBeNull();
    expect(screen.getByText(t.foot)).toBeInTheDocument();
  });
});
