import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("shin.onboarded", "1"));
});

test("랜딩에서 시작해 로그인, 실험실, 저장소까지", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "첫 실험 시작하기" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  await expect(page).toHaveURL(/\/lab$/);
  await expect(page.getByText("계산하기를 누르면 결과가 여기에 나옵니다.")).toBeVisible();
  await page
    .getByRole("navigation", { name: isMobile ? "하단 탭" : "주 메뉴" })
    .getByRole("link", { name: "저장소" })
    .click();
  await expect(page).toHaveURL(/\/saved$/);
  await expect(page.getByRole("button", { name: "실험실에서 열기" })).toHaveCount(3);
});

test("없는 경로는 실험실로 보내고 토스트를 띄운다", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/lab$/);
  await expect(page.getByText("그 화면은 이 목업에 없어 실험실로 왔습니다.")).toBeVisible();
});

test("테마 토글은 .dark 를 붙였다 뗀다", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/login");
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  const html = page.locator("html");
  await page.getByRole("button", { name: "시스템 설정" }).click(); // system -> light
  await expect(html).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "라이트" }).click(); // light -> dark
  await expect(html).toHaveClass(/dark/);
});

test("모바일에서는 하단 탭으로 오간다", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/login");
  await page.getByRole("button", { name: "데모로 들어가기" }).click();
  const tabs = page.getByRole("navigation", { name: "하단 탭" });
  await expect(tabs).toBeVisible();
  await tabs.getByRole("link", { name: "저장소" }).click();
  await expect(page).toHaveURL(/\/saved$/);
});
