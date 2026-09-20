import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { defaultRequest } from "@/demo/adapter";
import * as gen from "@/demo/generated/adapter";
import { VerdictTable } from "./verdict-table";

const result = gen.runLab(defaultRequest());

function rowOf(name: string) {
  return screen.getAllByRole("row").find((r) => within(r).queryByText(name) !== null)!;
}

describe("VerdictTable", () => {
  it("머리글은 표준 라벨, 시장 행이 먼저", () => {
    render(<VerdictTable result={result} />);
    const headers = screen.getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers[0]).toContain("업종");
    expect(headers[7]).toBe("선정");
    expect(headers[5]).toBe("1개월 뒤 실제");
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("시장")).toBeInTheDocument();
    expect(within(rows[1]).getByText("코스피")).toBeInTheDocument();
    expect(within(rows[1]).getByText("기준")).toBeInTheDocument();
  });

  it("고정 입력의 판정과 선정이 원본과 같다", () => {
    render(<VerdictTable result={result} />);
    const fin = rowOf("금융");
    expect(within(fin).getByText("KB금융")).toBeInTheDocument();
    expect(within(fin).getByText("성공")).toBeInTheDocument();
    expect(within(fin).getByText("선정")).toBeInTheDocument();
    expect(within(fin).getByText("+1.1%")).toBeInTheDocument();
    expect(within(fin).getByText("+1.2%")).toBeInTheDocument();
    const med = rowOf("의료");
    expect(within(med).getByText("실패")).toBeInTheDocument();
    expect(within(rowOf("에너지")).getByText("미선정")).toBeInTheDocument();
    expect(screen.getAllByText("내릴 듯")).toHaveLength(7);
    expect(within(rowOf("필수소비재")).getByLabelText("상승 73% · 횡보 27% · 하락 0%")).toBeInTheDocument();
  });

  it("바닥줄은 뽑은 업종 평균과 적중 수", () => {
    render(<VerdictTable result={result} />);
    expect(screen.getByText("뽑은 업종 3개 평균")).toBeInTheDocument();
    expect(screen.getByText("방향 2/3 · 범위 3/3")).toBeInTheDocument();
    expect(screen.getByText("+1.8%")).toBeInTheDocument();
  });

  it("업종을 펼치면 무엇이 밀었나가 나온다", async () => {
    render(<VerdictTable result={result} />);
    await userEvent.click(screen.getByRole("button", { name: "필수소비재 자세히" }));
    expect(screen.getByText("무엇이 밀었나")).toBeInTheDocument();
    expect(screen.getByText(/뉴스 방향/)).toBeInTheDocument();
  });

  it("실제가 없으면 — 와 채점 전", () => {
    const pending = { ...result, round1: { ...result.round1, estimates: result.round1.estimates.map((e) => ({ ...e, actual: null })) } };
    render(<VerdictTable result={pending} />);
    expect(within(rowOf("금융")).getByText("채점 전")).toBeInTheDocument();
  });
});
