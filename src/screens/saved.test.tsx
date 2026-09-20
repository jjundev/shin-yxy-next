import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { RouterProvider, createMemoryRouter } from "react-router";
import { clearLabIntent, peekLabIntent } from "@/app/lab-intent";
import { resetSaved } from "@/demo/saved";
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

describe("SavedScreen", () => {
  it("시드 셋을 최근 저장 순으로, 카드마다 스펙 7.2 항목", async () => {
    mount();
    const cards = await screen.findAllByRole("listitem");
    expect(cards.map((c) => c.getAttribute("aria-label"))).toEqual(["2025-10-15 실험", "2025-04-15 실험", "2024-01-15 실험"]);
    const first = within(cards[0]);
    expect(first.getByText("20거래일")).toBeInTheDocument();
    expect(first.getByText(/저장 2026-09-13/)).toBeInTheDocument();
    expect(first.getByText(/^업종 11개 중 /)).toBeInTheDocument();
    expect(first.getByText(/켠 재료 \d+개/)).toBeInTheDocument();
    expect(first.getByText(/뽑은 업종/)).toBeInTheDocument();
    expect(first.getByText("예상 성공")).toBeInTheDocument();
    expect(within(cards[1]).getByText("예상 실패")).toBeInTheDocument();
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
