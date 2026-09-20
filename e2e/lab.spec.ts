import { expect, test, type Page } from "@playwright/test";

async function enter(page: Page) {
  // 안내는 onboarding.spec 이 본다. 여기서는 일반 모드
  await page.addInitScript(() => localStorage.setItem("shin.onboarded", "1"));
  await page.goto("/login");
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  await expect(page).toHaveURL(/\/lab$/);
}

test("계산 → 요약 문장 → 저장 → 저장소 개수", async ({ page, isMobile }) => {
  await enter(page);
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
  await page.getByRole("button", { name: "왜?" }).first().click();
  const sheet = page.getByRole("dialog", { name: "계산" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText("재료 모으기", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("설정을 바꾸면 자동 재계산된다", async ({ page }) => {
  await enter(page);
  await expect(page.getByText(/업종 11개 중/)).toBeVisible();
  await page.getByRole("button", { name: "5거래일" }).click();
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
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: /예상 흐름/ })).toBeHidden();
  await expect(page.getByRole("columnheader", { name: "상승 · 횡보 · 하락" })).toBeHidden();
});

test("데스크톱: 좌측 설정 드로어 접기/펼치기 및 리사이즈", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await enter(page);
  const collapseBtn = page.getByRole("button", { name: "설정 패널 접기" });
  await expect(collapseBtn).toBeVisible();

  // 접기 테스트
  await collapseBtn.click();
  await expect(page.getByRole("complementary", { name: "설정" })).toBeHidden();
  const openBtn = page.getByRole("button", { name: "설정 패널 열기" });
  await expect(openBtn).toBeVisible();

  // 열기 테스트
  await openBtn.click();
  await expect(page.getByRole("complementary", { name: "설정" })).toBeVisible();

  // 리사이즈 핸들 확인
  const separator = page.getByRole("separator", { name: "설정 패널 너비 조절" });
  await expect(separator).toBeVisible();
  await expect(separator).toHaveAttribute("aria-valuenow", "320");
});

test("데스크톱: 우측 분석 드로어 열기/접기 및 리사이즈", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await enter(page);

  // 1280px 기본 뷰포트에서는 기본 접힘 상태 -> "분석 열기" 버튼 노출
  const openInspectorBtn = page.getByRole("button", { name: "분석 열기" });
  await expect(openInspectorBtn).toBeVisible();

  // 열기 클릭
  await openInspectorBtn.click();
  const inspector = page.getByRole("complementary", { name: "분석 인스펙터" });
  await expect(inspector).toBeVisible();

  // 리사이즈 분할선 핸들 확인
  const separator = page.getByRole("separator", { name: "분석 패널 너비 조절" });
  await expect(separator).toBeVisible();
  await expect(separator).toHaveAttribute("aria-valuenow", "340");

  // 접기 클릭
  const collapseInspectorBtn = page.getByRole("button", { name: "분석 패널 접기" });
  await expect(collapseInspectorBtn).toBeVisible();
  await collapseInspectorBtn.click();
  await expect(inspector).toBeHidden();
  await expect(openInspectorBtn).toBeVisible();
});
