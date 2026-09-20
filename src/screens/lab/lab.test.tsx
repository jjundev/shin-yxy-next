import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider, createMemoryRouter } from "react-router";
import { toast } from "sonner";
import { api } from "@/api/client";
import { ApiError, setRunDelay } from "@/demo/adapter";
import { resetSaved } from "@/demo/saved";
import { ThemeProvider } from "@/app/theme";
import { LabScreen } from "./index";

vi.mock("sonner", () => ({ toast: vi.fn() }));
setRunDelay(() => 0);

/** SummaryLine 은 숫자를 <b> 로 쪼개 넣으므로 문단 전체 글로 찾는다 */
const summary = (_: string, el: Element | null) =>
  el?.tagName === "P" && /업종 11개 중 3개/.test(el.textContent ?? "");

function mount() {
  const router = createMemoryRouter([{ path: "/lab", element: <LabScreen /> }], { initialEntries: ["/lab"] });
  render(<ThemeProvider><RouterProvider router={router} /></ThemeProvider>);
}

beforeEach(() => {
  localStorage.clear();
  resetSaved();
  vi.mocked(toast).mockClear();
  vi.restoreAllMocks();
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  }));
});

describe("LabScreen", () => {
  it("처음엔 레일과 빈 결과 한 줄, 저장은 비활성", async () => {
    mount();
    expect(await screen.findByRole("button", { name: "계산하기" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
    expect(screen.getByText("계산하기를 누르면 결과가 여기에 나옵니다.")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "기준 시점" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "20거래일" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("heading", { name: "맞았나" })).not.toBeInTheDocument();
  });

  it("계산하면 세 섹션이 채워지고 저장이 열린다", async () => {
    mount();
    await userEvent.click(await screen.findByRole("button", { name: "계산하기" }));
    expect(await screen.findByText(summary)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "계산" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "무엇을 뽑았나" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "맞았나" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "업종 순위" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    expect(screen.getAllByRole("button", { name: "왜?" })).toHaveLength(3);
  });

  it("저장하면 토스트와 저장됨 잠금, 설정을 바꾸면 dirty 한 줄", async () => {
    mount();
    await userEvent.click(await screen.findByRole("button", { name: "계산하기" }));
    await screen.findByText(summary);
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith("저장됨 · 2026-01-15", { id: "saved" }));
    expect(screen.getByRole("button", { name: "저장됨" })).toBeDisabled();
    expect((await api.saved()).length).toBe(4);
    await userEvent.click(screen.getByRole("button", { name: "5거래일" }));
    expect(screen.getByRole("status", { name: "설정 상태" })).toHaveTextContent("바꾼 세팅을 먼저 계산하세요");
    expect(screen.getByText(summary)).toBeInTheDocument(); // 결과 유지
  });

  it("슬라이더와 하루 이동으로 기준 시점을 바꾼다", async () => {
    mount();
    const slider = await screen.findByRole("slider", { name: "기준 시점" });
    await userEvent.click(screen.getByRole("button", { name: "하루 전" }));
    expect(screen.getByText("2026-01-14")).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: "0" } });
    // 맨 앞으로 가면 기준 시점 표시와 레일 왼쪽 끝 라벨이 같은 날짜다
    expect(screen.getAllByText("2016-01-04")).toHaveLength(2);
  });

  it("어댑터가 거부하면 세 섹션에 한 줄과 다시 시도, 다시 시도하면 된다", async () => {
    vi.spyOn(api, "run").mockRejectedValueOnce(new ApiError(404, "데모에는 없는 화면이다: /nope"));
    mount();
    await userEvent.click(await screen.findByRole("button", { name: "계산하기" }));
    expect(await screen.findAllByText("데모에는 없는 화면이다: /nope")).toHaveLength(3);
    const retry = screen.getAllByRole("button", { name: "다시 시도" });
    expect(retry).toHaveLength(3);
    await userEvent.click(retry[0]);
    expect(await screen.findByText(summary)).toBeInTheDocument();
  });

  it("층과 모드를 바꾸고 순위를 눌러 집중한다", async () => {
    mount();
    await userEvent.click(await screen.findByRole("button", { name: "계산하기" }));
    await screen.findByText(summary);
    // 업종 하나에 집중한 채 층을 바꾸면 집중은 시장으로 돌아간다
    await userEvent.click(within(screen.getByRole("list", { name: "업종 순위" })).getByRole("button", { name: /에너지/ }));
    await userEvent.click(screen.getByRole("radio", { name: "시장 · 1등 종목 11" }));
    expect(document.querySelector('[data-kind="focus"]')?.getAttribute("data-subject")).toMatch(/^0:/);
    const rank = screen.getByRole("list", { name: "업종 순위" });
    expect(within(rank).getByRole("button", { name: /기준선/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(rank).getByText("KB금융")).toBeInTheDocument();
    await userEvent.click(within(rank).getByRole("button", { name: /KB금융/ }));
    expect(document.querySelector('[data-kind="focus"]')?.getAttribute("data-subject")).toMatch(/^2:/);
    await userEvent.click(screen.getByRole("radio", { name: "시뮬레이션 경로 24" }));
    expect(document.querySelectorAll('[data-kind="sample"], [data-kind="dropped"]')).toHaveLength(24);
  });
});
