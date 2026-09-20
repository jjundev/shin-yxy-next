import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultRequest, getConfig } from "@/demo/adapter";
import { GuideCard } from "./guide-card";

const config = getConfig();
const request = defaultRequest();

beforeEach(() => {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  }));
});

describe("GuideCard", () => {
  it("1단계: 진행도와 제목, 본문, 용어 없음", () => {
    render(<GuideCard step={1} config={config} request={request} result={null} />);
    const card = screen.getByRole("region", { name: "1/4 · 예측하는 날과 채점하는 날이 달라요" });
    expect(within(card).getByText(/기준 시점은 예측을 시작하는 날/)).toBeInTheDocument();
    expect(within(card).queryByRole("term")).not.toBeInTheDocument();
  });
  it("2단계: 세 용어를 표준 라벨과 원본어로 풀고, 왜 이렇게 하나요? 가 계산 시트를 연다", async () => {
    render(<GuideCard step={2} config={config} request={request} result={null} />);
    const card = screen.getByRole("region", { name: /2\/4/ });
    expect(within(card).getAllByRole("term").map((t) => t.textContent)).toEqual(["입력 재료 · 재료", "뉴스 판독 · 판독", "자금 흐름 · 돈의 흐름"]);
    await userEvent.click(within(card).getByRole("button", { name: "왜 이렇게 하나요?" }));
    const sheet = await screen.findByRole("dialog", { name: "계산" });
    expect(within(sheet).getByText("재료 모으기")).toBeInTheDocument();
    expect(within(sheet).getByText("켠 재료 8개")).toBeInTheDocument();
  });
  it("4단계: 뽑음·안 뽑음 풀이, 왜? 는 맞았나 시트", async () => {
    render(<GuideCard step={4} config={config} request={request} result={null} />);
    const card = screen.getByRole("region", { name: /4\/4/ });
    expect(within(card).getAllByRole("term")).toHaveLength(2);
    await userEvent.click(within(card).getByRole("button", { name: "왜 이렇게 하나요?" }));
    expect(await screen.findByRole("dialog", { name: "맞았나" })).toBeInTheDocument();
  });
});
