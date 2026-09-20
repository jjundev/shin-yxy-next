import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { defaultRequest, getConfig } from "@/demo/adapter";
import * as gen from "@/demo/generated/adapter";
import { ResultSection } from "./section";
import { WhyCalc, WhyPicks, WhySheet, WhyVerdict } from "./why-sheet";

const why = <WhySheet title="계산" description="테스트"><p>본문</p></WhySheet>;

describe("ResultSection", () => {
  it("idle 이면 본문", () => {
    render(<ResultSection title="계산" status="idle" error={null} onRetry={() => {}} why={why}><p>결과</p></ResultSection>);
    expect(screen.getByRole("heading", { name: "계산" })).toBeInTheDocument();
    expect(screen.getByText("결과")).toBeInTheDocument();
  });

  it("running 이면 뼈대", () => {
    render(<ResultSection title="계산" status="running" error={null} onRetry={() => {}} why={why}><p>결과</p></ResultSection>);
    expect(screen.getByRole("status", { name: "계산 중" })).toBeInTheDocument();
    expect(screen.queryByText("결과")).not.toBeInTheDocument();
  });

  it("제목에 띄어쓰기가 있어도 이름 붙은 구역이다", () => {
    render(<ResultSection title="무엇을 뽑았나" status="idle" error={null} onRetry={() => {}} why={why}><p>결과</p></ResultSection>);
    expect(screen.getByRole("region", { name: "무엇을 뽑았나" })).toBeInTheDocument();
  });

  it("error 면 한 줄과 다시 시도", async () => {
    const onRetry = vi.fn();
    render(<ResultSection title="계산" status="error" error="데모에는 없는 화면이다" onRetry={onRetry} why={why}><p>결과</p></ResultSection>);
    expect(screen.getByText("데모에는 없는 화면이다")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("WhySheet", () => {
  it("왜? 를 누르면 시트가 열린다", async () => {
    render(why);
    await userEvent.click(screen.getByRole("button", { name: "왜?" }));
    expect(await screen.findByRole("dialog", { name: "계산" })).toBeInTheDocument();
    expect(screen.getByText("본문")).toBeInTheDocument();
  });

  it("세 본문이 원본 문구를 담는다", () => {
    const config = getConfig();
    const req = defaultRequest();
    render(<WhyCalc config={config} request={req} result={gen.runLab(req)} />);
    expect(screen.getByText("재료 모으기")).toBeInTheDocument();
    expect(screen.getByText("업종 3개 선정")).toBeInTheDocument();
    cleanup();
    render(<WhyPicks samples={24} />);
    expect(screen.getByText(/시뮬레이션한 24개 경로/)).toBeInTheDocument();
    expect(screen.getByText("시뮬레이션 경로")).toBeInTheDocument();
    cleanup();
    render(<WhyVerdict asOf="2026-01-15" />);
    expect(screen.getByText("확신도와 판정, 어떻게 계산되었을까요?")).toBeInTheDocument();
    expect(screen.getByText(/기준일 2026-01-15 장 마감/)).toBeInTheDocument();
  });
});
