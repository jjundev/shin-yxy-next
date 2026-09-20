import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { landing } from "@/content/landing";
import { Limits } from "./limits";

describe("Limits", () => {
  it("세 줄을 그대로 적는다", () => {
    render(<Limits />);
    expect(landing.limits.items).toHaveLength(3);
    for (const item of landing.limits.items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("제목이 있다", () => {
    render(<Limits />);
    expect(screen.getByRole("heading", { name: landing.limits.title })).toBeInTheDocument();
  });

  it("일부러 움직이지 않는다 — 스크럽이 아니고, 본문에 .rise 가 없고, --p 는 1 이다", () => {
    const { container } = render(<Limits />);
    const section = container.querySelector<HTMLElement>("#limits");
    expect(section).not.toBeNull();
    expect(container.querySelector('[data-slot="scrub-stage"]')).toBeNull();
    expect(container.querySelector("ul")?.querySelector(".rise")).toBeNull();
    expect(section?.style.getPropertyValue("--p")).toBe("1.000");
  });
});
