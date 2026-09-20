import { expect, test } from "@playwright/test";

test("첫 방문자: 랜딩 → 로그인 → 안내 네 단계를 실제 조작으로 → 재진입", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "첫 실험 시작하기" }).click();
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  await expect(page).toHaveURL(/\/lab$/);

  const list = page.getByRole("navigation", { name: "첫 실험" });
  await expect(list).toBeVisible();
  await expect(list.getByRole("listitem").nth(0)).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("region", { name: /1\/4/ })).toBeVisible();
  await expect(page.getByText("‘계산하기’를 누르면 결과가 나와요.")).toBeHidden();

  await page.getByRole("button", { name: "5거래일" }).click();
  await expect(page.getByRole("region", { name: /2\/4/ })).toBeVisible();
  await expect(list.getByRole("listitem").nth(1)).toHaveAttribute("aria-current", "step");

  // 모바일은 2단계에서 "무엇으로" 가 저절로 펼쳐진다
  await page.getByRole("region", { name: "뉴스", exact: true }).getByRole("button", { name: "자세히" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("region", { name: /3\/4/ })).toBeVisible();

  await page.getByRole("button", { name: "결과 확인하기" }).click();
  await expect(page.getByRole("region", { name: /4\/4/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "맞았나" })).toBeVisible();

  // 표 머리가 아니라 마지막 줄(뽑은 업종 평균)까지 내려가야 4단계가 끝난다
  await page.locator('[data-slot="verdict-footer"]').scrollIntoViewIfNeeded();
  await expect(list).toBeHidden();
  await expect(page.getByRole("region", { name: /4\/4/ })).toBeHidden();
  await expect(page.getByText(/업종 11개 중 3개/)).toBeVisible(); // 결과는 남는다

  await page.reload();
  await expect(page.getByText(/업종 11개 중 3개/)).toBeVisible();
  await expect(list).toBeHidden();

  await page.getByRole("button", { name: "메뉴" }).click();
  await page.getByRole("menuitem", { name: "첫 실험 다시 보기" }).click();
  await expect(page.getByRole("region", { name: /1\/4/ })).toBeVisible();
  await expect(list).toBeVisible();
});

test("건너뛰기는 즉시 일반 모드이고 새로고침해도 다시 안 뜬다", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  await page.getByRole("button", { name: "건너뛰기" }).click();
  await expect(page.getByRole("navigation", { name: "첫 실험" })).toBeHidden();
  await expect(page.getByText(/업종 11개 중 3개/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("navigation", { name: "첫 실험" })).toBeHidden();
});
