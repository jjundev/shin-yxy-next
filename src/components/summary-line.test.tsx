import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultRequest } from "@/demo/adapter";
import * as gen from "@/demo/generated/adapter";
import type { RunResult } from "@/demo/types";
import { SummaryLine, summaryText } from "./summary-line";

const FIXED =
  "업종 11개 중 3개(의료 · 금융 · 필수소비재)를 뽑아 1등 종목으로 1개월 뒤 +1.2%를 예상했다. 실제는 +0.7%, 같은 기간 시장은 −0.6% — 시장보다 +1.3%p 더 벌었다 (왕복 거래비용 −0.3%p를 뺀 값). 예상 성공.";

describe("SummaryLine", () => {
  const result = gen.runLab(defaultRequest());

  it("고정 입력은 원본 문장과 글자 단위로 같다", () => {
    const { container } = render(<SummaryLine result={result} />);
    expect(container.textContent).toBe(FIXED);
    expect(summaryText(result)).toBe(FIXED);
  });

  it("실패면 못 벌었다 · 예상 실패", () => {
    const r = gen.runLab({ ...defaultRequest(), asOf: "2025-04-15" });
    expect(summaryText(r)).toContain("못 벌었다");
    expect(summaryText(r)).toMatch(/예상 실패\.$/);
  });

  it("기간이 안 지났으면 실제 성적이 없다고 말한다", () => {
    const r: RunResult = { ...result, avgReturn: null, benchReturn: null, horizonReached: false };
    expect(summaryText(r)).toMatch(/를 예상했다\. 아직 1개월이 안 지나 실제 성적은 없다\.$/);
  });

  it("뽑은 게 없으면 시장 예상만 말한다", () => {
    const r: RunResult = { ...result, rows: result.rows.map((x) => ({ ...x, selected: false })) };
    expect(summaryText(r)).toBe("업종 11개 중 0개를 뽑았다 — 전부 시장보다 못할 것 같거나, 내릴 것 같다. 시장은 1개월 뒤 −0.1%로 봤다.");
  });
});
