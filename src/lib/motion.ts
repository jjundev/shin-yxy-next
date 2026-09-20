/** 사용자가 움직임을 줄여 달라고 했나. jsdom 에는 matchMedia 가 없어 false 로 떨어진다 */
export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
