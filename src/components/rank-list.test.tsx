import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { defaultRequest } from "@/demo/adapter";
import * as gen from "@/demo/generated/adapter";
import { RankList } from "./rank-list";

const result = gen.runLab(defaultRequest());
const layer1 = result.paths.subjects.filter((s) => s.round === 0 || s.round === 1);

describe("RankList", () => {
  it("실제 수익률 내림차순, 배지와 범위 표시", () => {
    render(<RankList subjects={layer1} focus={null} onFocus={() => {}} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(12);
    expect(within(items[0]).getByText("에너지")).toBeInTheDocument();
    expect(within(items[0]).getByText("+2.9%")).toBeInTheDocument();
    expect(within(items[0]).getByText("미선정")).toBeInTheDocument();
    expect(within(items[1]).getByText("선정")).toBeInTheDocument();
    expect(within(items[9]).getByText("기준선")).toBeInTheDocument();
    expect(screen.getAllByText("범위 ✓")).toHaveLength(12);
  });

  it("누르면 그 대상에 집중", async () => {
    const onFocus = vi.fn();
    render(<RankList subjects={layer1} focus={null} onFocus={onFocus} />);
    await userEvent.click(screen.getByRole("button", { name: /금융/ }));
    expect(onFocus).toHaveBeenCalledWith({ round: 1, subjectId: 7 });
  });

  it("집중한 행은 aria-pressed", () => {
    render(<RankList subjects={layer1} focus={{ round: 1, subjectId: 7 }} onFocus={() => {}} />);
    expect(screen.getByRole("button", { name: /금융/ })).toHaveAttribute("aria-pressed", "true");
  });
  it("실제가 없으면 예상값 내림차순, 범위 배지 없음", () => {
    const noActual = layer1.map((s) => ({ ...s, actual: [] }));
    const top = [...noActual].sort((a, b) => b.center - a.center)[0];
    render(<RankList subjects={noActual} focus={null} onFocus={() => {}} />);
    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByText(top.name)).toBeInTheDocument();
    expect(items[0]).toHaveTextContent("예상");
    expect(screen.queryByText("범위 ✓")).toBeNull();
    expect(screen.queryByText("범위 ✗")).toBeNull();
  });
});
