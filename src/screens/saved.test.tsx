import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider, createMemoryRouter } from "react-router";
import { api } from "@/api/client";
import { clearLabIntent, peekLabIntent } from "@/app/lab-intent";
import { resetSaved } from "@/demo/saved";
import { formatDate } from "@/lib/format";
import { SavedScreen } from "./saved";

function mount() {
  const router = createMemoryRouter(
    [{ path: "/saved", element: <SavedScreen /> }, { path: "/lab", element: <p>실험실 자리</p> }],
    { initialEntries: ["/saved"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  resetSaved();
  clearLabIntent();
});

afterEach(() => vi.restoreAllMocks());

describe("SavedScreen", () => {
  it("시드 셋을 최근 저장 순으로, 카드마다 스펙 7.2 항목", async () => {
    mount();
    const cards = await screen.findAllByRole("listitem");
    expect(cards.map((c) => c.getAttribute("aria-label"))).toEqual(["2025-10-15 실험", "2025-04-15 실험", "2024-01-15 실험"]);
    const first = within(cards[0]);
    expect(first.getByText("20거래일")).toBeInTheDocument();
    // 시드는 09:00 UTC — KST 에서는 같은 날이지만, 기계의 시간대에 기대지 않는다
    const savedDay = formatDate((await api.saved())[0].savedAt);
    expect(first.getByText(new RegExp(`저장 ${savedDay}`))).toBeInTheDocument();
    expect(first.getByText(/^업종 11개 중 /)).toBeInTheDocument();
    expect(first.getByText(/켠 재료 \d+개/)).toBeInTheDocument();
    expect(first.getByText(/뽑은 업종/)).toBeInTheDocument();
    expect(first.getByText("예상 성공")).toBeInTheDocument();
    expect(within(cards[1]).getByText("예상 실패")).toBeInTheDocument();
  });

  it("불러오기가 거부되면 한 줄과 다시 시도, 다시 시도하면 카드가 나온다", async () => {
    vi.spyOn(api, "saved").mockRejectedValueOnce(new Error("x"));
    mount();
    expect(await screen.findByText("저장한 실험을 불러오지 못했어요.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findAllByRole("listitem")).toHaveLength(3);
  });

  it("실험실에서 열기는 열기 의도를 심고 실험실로 간다", async () => {
    const router = mount();
    const cards = await screen.findAllByRole("listitem");
    await userEvent.click(within(cards[1]).getByRole("button", { name: "실험실에서 열기" }));
    const intent = peekLabIntent();
    expect(intent?.kind).toBe("open");
    expect(intent?.kind === "open" && intent.saved.request.asOf).toBe("2025-04-15");
    expect(router.state.location.pathname).toBe("/lab");
  });
});
