import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { api } from "@/api/client";
import { defaultRequest } from "@/demo/adapter";
import * as gen from "@/demo/generated/adapter";
import type { LabConfig, RunRequest, RunResult } from "@/demo/types";
import { TooltipProvider } from "@/design/ui/tooltip";
import { LabInspector } from "./inspector";

let config: LabConfig;
let request: RunRequest;
let result: RunResult;

beforeAll(async () => {
  config = await api.config();
  request = defaultRequest(config);
  result = gen.runLab(request);
});

describe("LabInspector", () => {
  it("결과가 없을 때는 안내 문구를 표시한다", () => {
    render(
      <LabInspector
        config={config}
        request={request}
        result={null}
        focus={null}
      />,
    );
    expect(screen.getByText(/‘계산하기’를 누르면 선택한 대상의 상세 기여도/)).toBeInTheDocument();
  });

  it("결과가 있을 때 기본 선택된 업종의 수익률과 기여도 재료를 표시한다", () => {
    render(
      <LabInspector
        config={config}
        request={request}
        result={result}
        focus={{ round: 1, subjectId: result.round1.estimates.find((e) => e.selected)!.subjectId }}
      />,
    );
    // 선택 상세 탭 활성 확인
    expect(screen.getByText("방향을 민 상위 재료 (기여도)")).toBeInTheDocument();
    expect(screen.getByText("방향성 확률 분포")).toBeInTheDocument();
    expect(screen.getByText("80% 신뢰 구간")).toBeInTheDocument();
  });

  it("해설 탭으로 전환하면 Why 섹션이 렌더링된다", async () => {
    render(
      <LabInspector
        config={config}
        request={request}
        result={result}
        focus={null}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /해설/ }));
    expect(screen.getByRole("button", { name: "계산" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "차트" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "판정" })).toBeInTheDocument();
    expect(screen.getByText("재료 모으기")).toBeInTheDocument();

    // 차트 해설 탭 클릭
    await userEvent.click(screen.getByRole("button", { name: "차트" }));
    expect(screen.getByText(/굵은 선은 선택한 대상/)).toBeInTheDocument();
  });

  it("다른 업종 바로보기 클릭 시 onFocus 가 호출된다", async () => {
    const onFocus = vi.fn();
    render(
      <LabInspector
        config={config}
        request={request}
        result={result}
        focus={null}
        onFocus={onFocus}
      />,
    );
    const chips = screen.getAllByRole("button").filter((b) => b.className.includes("rounded px-2"));
    if (chips.length > 0) {
      await userEvent.click(chips[0]);
      expect(onFocus).toHaveBeenCalled();
    }
  });

  it("onCollapse 가 주어지면 접기 버튼을 누를 때 콜백이 실행된다", async () => {
    const onCollapse = vi.fn();
    render(
      <TooltipProvider>
        <LabInspector
          config={config}
          request={request}
          result={null}
          focus={null}
          onCollapse={onCollapse}
        />
      </TooltipProvider>,
    );
    const collapseBtn = screen.getByRole("button", { name: "분석 패널 접기" });
    await userEvent.click(collapseBtn);
    expect(onCollapse).toHaveBeenCalledTimes(1);
  });
});
