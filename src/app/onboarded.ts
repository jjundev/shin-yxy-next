/** 상위 스펙 3.5·5.3: 안내 완료 플래그는 브라우저 저장소 */
const KEY = "shin.onboarded";

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true; // 저장소를 못 읽으면 안내를 띄우지 않는다. 화면이 도는 게 먼저다
  }
}

export function setOnboarded(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // 저장 못 해도 이번 세션의 안내는 이미 끝났다
  }
}

export function clearOnboarded(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 위와 같다
  }
}
