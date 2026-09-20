import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/api/client";
import { ApiError, defaultRequest, getConfig } from "@/demo/adapter";
import { Ingredients } from "./ingredients";

const config = getConfig();

beforeEach(() => vi.restoreAllMocks());

describe("Ingredients", () => {
  it("세 섹션과 원본 요약 한 줄", async () => {
    render(<Ingredients config={config} request={defaultRequest()} onModules={() => {}} />);
    expect(await screen.findByText("일정 3건 · 정책 등 · 계절 끔")).toBeInTheDocument();
    expect(await screen.findByText("뉴스 판독 51건 · 시장 17 · 업종 37")).toBeInTheDocument();
    expect(screen.getByText("이 서버에는 유사 국면 재료가 없다")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "주기 재료" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "유사 국면" })).toBeDisabled();
  });

  it("주기를 펼치면 일정 표와 모듈 토글", async () => {
    const onModules = vi.fn();
    render(<Ingredients config={config} request={defaultRequest()} onModules={onModules} />);
    const cycle = screen.getByRole("region", { name: "주기" });
    await userEvent.click(within(cycle).getByRole("button", { name: "자세히" }));
    expect(await within(cycle).findByText("금융 정책 발표 예정")).toBeInTheDocument();
    expect(within(cycle).getByText(/기준일 뒤에 알려짐/)).toBeInTheDocument();
    expect(within(cycle).getByRole("switch", { name: "월별 계절성" })).not.toBeChecked();
    await userEvent.click(within(cycle).getByRole("switch", { name: "일정 폭 (업계 시황)" }));
    expect(onModules).toHaveBeenCalledWith(["cal"], false);
    await userEvent.click(within(cycle).getByRole("switch", { name: "주기 재료" }));
    expect(onModules).toHaveBeenLastCalledWith(["cal", "evt"], false);
  });

  it("뉴스를 펼치면 판독 있는 기사만, 토글로 나머지", async () => {
    render(<Ingredients config={config} request={defaultRequest()} onModules={() => {}} />);
    const news = screen.getByRole("region", { name: "뉴스" });
    await userEvent.click(within(news).getByRole("button", { name: "자세히" }));
    expect(await within(news).findByText("2026-01-15 앞 7일 · 기사 76 · 판독 54 (기준일 뒤 3)")).toBeInTheDocument();
    expect(within(news).getAllByRole("listitem")).toHaveLength(54);
    await userEvent.click(within(news).getByRole("button", { name: "판독 없는 22건 보기" }));
    expect(within(news).getAllByRole("listitem")).toHaveLength(76);
  });

  it("뉴스 영향은 꺼져 있고 뉴스·폭·체 재료를 보여 준다", async () => {
    render(<Ingredients config={config} request={defaultRequest()} onModules={() => {}} />);
    const impact = screen.getByRole("region", { name: "뉴스 영향" });
    await userEvent.click(within(impact).getByRole("button", { name: "자세히" }));
    expect(within(impact).getByText("끔 — 계산엔 안 들어갔다.")).toBeInTheDocument();
    expect(within(impact).getByRole("switch", { name: "뉴스 방향" })).toBeChecked();
    expect(within(impact).getByRole("switch", { name: "변동성지수" })).toBeChecked();
    expect(within(impact).getByRole("switch", { name: "서킷브레이커 ±20%" })).toBeChecked();
  });

  it("2016-01-15 기준이면 변동성지수는 못 쓴다", async () => {
    render(<Ingredients config={config} request={{ ...defaultRequest(), asOf: "2016-01-15" }} onModules={() => {}} />);
    const impact = screen.getByRole("region", { name: "뉴스 영향" });
    await userEvent.click(within(impact).getByRole("button", { name: "자세히" }));
    expect(within(impact).getByRole("switch", { name: "변동성지수" })).toBeDisabled();
    expect(within(impact).getByText("데이터가 2016-02-01 부터라 이 기준일엔 못 쓴다")).toBeInTheDocument();
  });

  it("뉴스가 실패하면 그 섹션 안에 한 줄과 다시 시도", async () => {
    vi.spyOn(api, "news").mockRejectedValueOnce(new ApiError(404, "없다"));
    render(<Ingredients config={config} request={defaultRequest()} onModules={() => {}} />);
    const news = screen.getByRole("region", { name: "뉴스" });
    expect(await within(news).findByText("뉴스를 불러오지 못했다.")).toBeInTheDocument();
    await userEvent.click(within(news).getByRole("button", { name: "다시 시도" }));
    expect(await within(news).findByText(/뉴스 판독 51건/)).toBeInTheDocument();
  });
});
