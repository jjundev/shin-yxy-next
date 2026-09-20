import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { landing } from "@/content/landing";
import { Preview } from "./preview";

describe("Preview", () => {
  it("실험실 스크린샷 자리 둘이 그림으로 잡힌다", () => {
    render(<Preview />);
    expect(screen.getByRole("img", { name: landing.preview.imageAlt })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: landing.preview.imageMobileAlt })).toBeInTheDocument();
  });

  it("두 자리 다 아직 파일이 없어 placeholder 다", () => {
    const { container } = render(<Preview />);
    for (const id of ["lab-full", "lab-mobile"]) {
      const slot = container.querySelector<HTMLElement>(`[data-asset="${id}"]`);
      expect(slot).not.toBeNull();
      expect(slot?.querySelector("img")).toBeNull();
    }
  });

  it("짚는 자리 셋을 이름과 한 줄로 적는다", () => {
    render(<Preview />);
    for (const h of landing.preview.hotspots) {
      expect(screen.getByText(h.name)).toBeInTheDocument();
      expect(screen.getByText(h.body)).toBeInTheDocument();
    }
  });

  it("스크럽 섹션이다 — sticky 무대를 갖는다", () => {
    const { container } = render(<Preview />);
    expect(container.querySelector('[data-slot="scrub-stage"]')).not.toBeNull();
  });
});
