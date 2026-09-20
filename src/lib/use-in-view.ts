import { useEffect, useRef, type RefObject } from "react";

/** ref 요소가 뷰포트에 threshold 만큼 들어오면 onSeen 을 한 번 부르고 관찰을 끝낸다.
 *  enabled 가 false 거나 IntersectionObserver 가 없으면(jsdom) 아무것도 안 한다.
 *  안내 4단계 "판정 표까지 스크롤" 감지용 (상위 스펙 5.2) */
export function useInView(
  ref: RefObject<Element | null>,
  enabled: boolean,
  onSeen: () => void,
  threshold = 0.2,
): void {
  const latest = useRef(onSeen);
  useEffect(() => {
    latest.current = onSeen;
  });
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      latest.current();
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, enabled, threshold]);
}
