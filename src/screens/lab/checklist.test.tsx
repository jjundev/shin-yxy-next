import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checklist } from "./checklist";

describe("Checklist", () => {
  it("네 단계, 지금 단계에 aria-current, 앞 단계는 완료", () => {
    render(<Checklist step={3} onSkip={() => {}} />);
    const nav = screen.getByRole("navigation", { name: "첫 실험" });
    const items = within(nav).getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(["완료언제로 갈까", "완료무엇을 볼까", "계산하기", "4결과 읽기"]);
    expect(items[2]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
  });
  it("건너뛰기를 부른다", async () => {
    const onSkip = vi.fn();
    render(<Checklist step={1} onSkip={onSkip} />);
    await userEvent.click(screen.getByRole("button", { name: "건너뛰기" }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
