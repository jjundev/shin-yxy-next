import { expect, test } from "@playwright/test";

test("건너뛰기 → 계산 → 저장 → 저장소에서 열기 → 새로 계산", async ({ page, isMobile }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  await page.getByRole("button", { name: "건너뛰기" }).click();

  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByText(/업종 11개 중 3개\(의료 · 금융 · 필수소비재\)/)).toBeVisible();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByText("저장됨 · 2026-01-15")).toBeVisible();

  const nav = page.getByRole("navigation", { name: isMobile ? "하단 탭" : "주 메뉴" });
  await nav.getByRole("link", { name: "저장소" }).click();
  await expect(page).toHaveURL(/\/saved$/);
  // 저장 토스트도 listitem 이다(sonner 가 ol>li 로 그린다). 카드만 고른다
  const cards = page.getByRole("listitem", { name: /실험$/ });
  await expect(cards).toHaveCount(4);
  const first = cards.first();
  await expect(first).toHaveAttribute("aria-label", "2026-01-15 실험");
  await expect(first).toContainText("업종 11개 중 3개(의료 · 금융 · 필수소비재)");
  await expect(first).toContainText("켠 재료 8개");
  await expect(first).toContainText("뽑은 업종 의료 · 금융 · 필수소비재");
  await expect(first).toContainText("예상 성공");

  await first.getByRole("button", { name: "실험실에서 열기" }).click();
  await expect(page).toHaveURL(/\/lab$/);
  const status = page.getByRole("status", { name: "설정 상태" });
  await expect(status).toHaveText("저장한 실험을 보는 중 · 2026-01-15");
  await expect(page.getByRole("button", { name: "저장됨" })).toBeDisabled();
  await expect(page.getByText(/업종 11개 중 3개\(의료 · 금융 · 필수소비재\)/)).toBeVisible();
  await expect(page.getByRole("table")).toContainText("KB금융");

  await page.getByRole("button", { name: "새로 계산" }).click();
  await expect(status).toHaveText("");
  await expect(page.getByRole("button", { name: "계산하기" })).toBeVisible();
  await expect(page.getByRole("button", { name: "저장", exact: true })).toBeEnabled();
});

test("새로고침하면 저장 항목은 시드 셋으로 돌아간다", async ({ page, isMobile }) => {
  await page.addInitScript(() => localStorage.setItem("shin.onboarded", "1"));
  await page.goto("/login");
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  await page.getByRole("button", { name: "계산하기" }).click();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByText("저장됨 · 2026-01-15")).toBeVisible();
  // 저장은 메모리에만 있다. page.goto 는 문서를 새로 읽어 시드로 돌아가므로 화면 안에서 옮긴다
  await page
    .getByRole("navigation", { name: isMobile ? "하단 탭" : "주 메뉴" })
    .getByRole("link", { name: "저장소" })
    .click();
  await expect(page).toHaveURL(/\/saved$/);
  const cards = page.getByRole("listitem", { name: /실험$/ });
  await expect(cards).toHaveCount(4);
  await page.reload();
  await expect(cards).toHaveCount(3);
});
