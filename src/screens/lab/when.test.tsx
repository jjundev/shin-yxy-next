import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { defaultRequest, getConfig } from "@/demo/adapter";
import { WhenSection } from "./when";

const config = getConfig();

/** asOf 만 상태로 들고 있는 껍데기 — 나머지 손잡이는 이 테스트에서 안 쓴다 */
function Harness() {
  const base = defaultRequest();
  const [asOf, setAsOf] = useState(base.asOf);
  return (
    <WhenSection
      config={config}
      request={{ ...base, asOf }}
      status="idle"
      hasResult={false}
      dirty={false}
      canSave={false}
      saved={false}
      onAsOf={setAsOf}
      onHorizon={() => {}}
      onRun={() => {}}
      onSave={() => {}}
    />
  );
}

describe("WhenSection", () => {
  it("슬라이더는 칸 번호가 아니라 날짜를 읽어 준다", async () => {
    render(<Harness />);
    expect(screen.getByRole("slider", { name: "기준 시점" })).toHaveAttribute("aria-valuetext", "2026-01-15");
    await userEvent.click(screen.getByRole("button", { name: "하루 전" }));
    expect(screen.getByRole("slider", { name: "기준 시점" })).toHaveAttribute("aria-valuetext", "2026-01-14");
  });
});
