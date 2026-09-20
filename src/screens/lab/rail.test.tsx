import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LabRail } from "./rail";

/** jsdom 에는 미디어 쿼리가 없으므로 md+ 쪽(버튼이 md:hidden)은 타입·린트로만 지킨다 */
describe("LabRail", () => {
  it("모바일 토글이 재료 본문을 접고 편다", async () => {
    render(<LabRail when={<p>언제</p>} ingredients={<p>재료 본문</p>} />);
    const toggle = screen.getByRole("button", { expanded: false });
    const body = document.getElementById("what-body");
    expect(toggle).toHaveAttribute("aria-controls", "what-body");
    expect(body).toHaveClass("hidden");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(body).not.toHaveClass("hidden");
  });
});
