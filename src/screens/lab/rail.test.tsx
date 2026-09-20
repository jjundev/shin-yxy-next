import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/design/ui/tooltip";
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
  it("체크리스트 슬롯이 맨 위에 오고, 흐리기는 opacity 만 준다", () => {
    const { container } = render(
      <LabRail checklist={<p>첫 실험</p>} when={<p>언제</p>} ingredients={<p>재료 본문</p>} dim={{ ingredients: true }} />,
    );
    const aside = container.querySelector("aside")!;
    expect(aside.firstElementChild).toHaveTextContent("첫 실험");
    expect(container.querySelector('[data-slot="when"]')).not.toHaveClass("opacity-50");
    expect(document.getElementById("what-body")!.closest("section")).toHaveClass("opacity-50");
  });

  it("openIngredients 가 켜지면 모바일 접힘이 펴진다", () => {
    const { rerender } = render(<LabRail when={<p>언제</p>} ingredients={<p>재료 본문</p>} />);
    expect(document.getElementById("what-body")).toHaveClass("hidden");
    rerender(<LabRail when={<p>언제</p>} ingredients={<p>재료 본문</p>} openIngredients />);
    expect(document.getElementById("what-body")).not.toHaveClass("hidden");
  });

  it("onCollapse 가 주어지면 접기 버튼을 누를 때 콜백이 실행된다", async () => {
    const onCollapse = vi.fn();
    render(
      <TooltipProvider>
        <LabRail when={<p>언제</p>} onCollapse={onCollapse} />
      </TooltipProvider>,
    );
    const collapseBtn = screen.getByRole("button", { name: "설정 패널 접기" });
    await userEvent.click(collapseBtn);
    expect(onCollapse).toHaveBeenCalledTimes(1);
  });
});
