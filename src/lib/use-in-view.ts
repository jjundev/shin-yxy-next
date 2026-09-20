import { useEffect, useRef, type RefObject } from "react";

export interface InViewOptions {
  /** 얼마나 들어와야 본 것으로 치나. 기본 0.2 */
  threshold?: number;
  /** ref 안에서 실제로 관찰할 요소를 고른다. null 이면 ref 요소를 그대로 본다 */
  select?: (root: Element) => Element | null;
}

/** ref 요소(또는 select 가 고른 그 안의 요소)가 뷰포트에 threshold 만큼 들어오면
 *  onSeen 을 한 번 부르고 관찰을 끝낸다.
 *  enabled 가 false 거나 IntersectionObserver 가 없으면(jsdom) 아무것도 안 한다.
 *  안내 4단계 "판정 표까지 스크롤" 감지용 (상위 스펙 5.2). 섹션 머리는 키 큰 화면에서
 *  결과가 그려지자마자 20% 보이므로, 표의 마지막 줄을 골라 관찰한다 */
export function useInView(
  ref: RefObject<Element | null>,
  enabled: boolean,
  onSeen: () => void,
  options: InViewOptions = {},
): void {
  const { threshold = 0.2, select } = options;
  const latest = useRef(onSeen);
  const pick = useRef(select);
  useEffect(() => {
    latest.current = onSeen;
    pick.current = select;
  });
  useEffect(() => {
    const root = ref.current;
    if (!enabled || !root || typeof IntersectionObserver === "undefined") return;
    const el = (pick.current ? pick.current(root) : null) ?? root;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      latest.current();
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, enabled, threshold]);
}
