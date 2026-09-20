import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { landing } from "@/content/landing";
import { strings } from "@/content/strings";
import { fixedResult } from "@/test/fixture";
import { Evidence } from "./evidence";

const t = landing.evidence;

beforeEach(() => {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

describe("Evidence", () => {
  it("실험실의 판정 표를 그대로 박는다 — 표에 접근 가능한 이름이 있다", () => {
    render(<Evidence result={fixedResult()} error={false} onRetry={() => {}} />);
    expect(screen.getByRole("table", { name: strings.lab.verdict.title })).toBeInTheDocument();
  });

  it("설정 한 줄과 꼬리말이 있다", () => {
    render(<Evidence result={fixedResult()} error={false} onRetry={() => {}} />);
    expect(screen.getByText(t.setup("2026-01-15", "1개월"))).toBeInTheDocument();
    expect(screen.getByText(t.foot)).toBeInTheDocument();
  });

  it("표는 걸러지지 않는다 — 시장 한 줄과 업종 열하나가 다 있다", () => {
    const result = fixedResult();
    render(<Evidence result={result} error={false} onRetry={() => {}} />);
    const table = screen.getByRole("table", { name: strings.lab.verdict.title });
    for (const s of result.round1.estimates) {
      expect(table).toHaveTextContent(s.name);
    }
    expect(result.round1.estimates).toHaveLength(11);
  });

  it("실패하면 표 대신 한 줄 안내와 다시 시도가 나오고, 눌리면 onRetry 가 불린다", async () => {
    const onRetry = vi.fn();
    render(<Evidence result={null} error onRetry={onRetry} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText(strings.lab.runFailed)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: strings.lab.retry }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("아직 결과가 없으면 꼬리말만 남고 조용하다", () => {
    render(<Evidence result={null} error={false} onRetry={() => {}} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: strings.lab.retry })).not.toBeInTheDocument();
    expect(screen.getByText(t.foot)).toBeInTheDocument();
  });
});
