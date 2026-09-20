import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AssetSlot } from "./asset-slot";

vi.mock("@/assets/landing/manifest", () => ({
  landingAssets: {
    "lab-full": { light: "/light.webp", dark: "/dark.webp" },
    "lab-mobile": { light: "/mobile.webp" },
  },
}));

describe("AssetSlot", () => {
  it("파일이 없으면 점선 자리에 id 와 설명을 적는다", () => {
    render(<AssetSlot id="hero-aurora" alt="추상 배경" ratio="16/9" />);
    const slot = screen.getByRole("img", { name: "추상 배경" });
    expect(slot).toHaveAttribute("data-asset", "hero-aurora");
    expect(slot).toHaveTextContent("hero-aurora");
    expect(slot).toHaveTextContent("16/9");
  });

  it("파일이 있으면 그 그림을 쓴다", () => {
    render(<AssetSlot id="lab-mobile" alt="좁은 화면" ratio="9/16" />);
    const img = screen.getByAltText("좁은 화면");
    expect(img).toHaveAttribute("src", "/mobile.webp");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("decorative 면 접근성 트리에서 빠진다", () => {
    const { container } = render(<AssetSlot id="hero-aurora" alt="추상 배경" ratio="16/9" decorative />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector('[data-asset="hero-aurora"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("다크 파일이 따로 있으면 둘을 넣고 클래스로 바꾼다 — 접근 가능한 그림은 하나", () => {
    render(<AssetSlot id="lab-full" alt="실험실 전체" ratio="16/10" />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByAltText("실험실 전체")).toHaveClass("dark:hidden");
    const hidden = document.querySelector('img[aria-hidden="true"]');
    expect(hidden).toHaveAttribute("src", "/dark.webp");
  });
});
