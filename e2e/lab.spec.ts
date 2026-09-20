import { expect, test, type Page } from "@playwright/test";

async function enter(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  await expect(page).toHaveURL(/\/lab$/);
}

test("계산 → 요약 문장 → 저장 → 저장소 개수", async ({ page, isMobile }) => {
  await enter(page);
  await expect(page.getByText("계산하기를 누르면 결과가 여기에 나옵니다.")).toBeVisible();
  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByText(/업종 11개 중 3개\(의료 · 금융 · 필수소비재\)를 뽑아/)).toBeVisible();
  await expect(page.getByRole("table")).toContainText("KB금융");
  await expect(page.getByText("방향 2/3 · 범위 3/3")).toBeVisible();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByText("저장됨 · 2026-01-15")).toBeVisible();
  await expect(page.getByRole("button", { name: "저장됨" })).toBeDisabled();
  const nav = page.getByRole("navigation", { name: isMobile ? "하단 탭" : "주 메뉴" });
  await expect(nav.getByRole("link", { name: "저장소" })).toContainText("4");
  await nav.getByRole("link", { name: "저장소" }).click();
  await expect(page.getByRole("button", { name: "실험실에서 열기" })).toHaveCount(4);
});

test("왜? 시트가 열리고 닫힌다", async ({ page }) => {
  await enter(page);
  await page.getByRole("button", { name: "계산하기" }).click();
  await page.getByRole("button", { name: "왜?" }).first().click();
  const sheet = page.getByRole("dialog", { name: "계산" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText("모은다", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("설정을 바꾸면 dirty 한 줄, 다시 계산하면 사라진다", async ({ page }) => {
  await enter(page);
  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByText(/업종 11개 중/)).toBeVisible();
  await page.getByRole("button", { name: "5거래일" }).click();
  await expect(page.getByText("바꾼 세팅을 먼저 계산하세요")).toBeVisible();
  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByText("바꾼 세팅을 먼저 계산하세요")).toBeHidden();
  await expect(page.getByRole("region", { name: "계산" }).getByText(/1주 뒤/)).toBeVisible();
});

test("모바일: 무엇으로는 접혀 있고, 표에서 두 열이 숨는다", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await enter(page);
  const toggle = page.getByRole("button", { name: /무엇으로/ });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("region", { name: "주기" })).toBeHidden();
  await toggle.click();
  await expect(page.getByRole("region", { name: "주기" })).toBeVisible();
  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: /예상 흐름/ })).toBeHidden();
  await expect(page.getByRole("columnheader", { name: "상승 · 횡보 · 하락" })).toBeHidden();
});
