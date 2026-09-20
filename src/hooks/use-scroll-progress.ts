import { useEffect, useRef, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/motion";

export type ProgressSpan = "enter" | "cover";

export interface ScrollProgressOptions {
  /** 관찰할 수 없을 때(jsdom·감속 모션) 고정할 값. 섹션마다 가장 읽기 좋은 상태를 고른다. 기본 1 */
  rest?: number;
  /** "enter": 요소 위가 뷰포트 바닥에 닿을 때 0, 요소 바닥이 뷰포트 위로 나갈 때 1.
   *  "cover": 요소 위가 뷰포트 위에 닿을 때 0, 요소 바닥이 뷰포트 바닥에 닿을 때 1 */
  span?: ProgressSpan;
  /** CSS 로 못 하는 것만(굴림 카운터의 글자). 매 프레임 불린다 — React state 를 건드리지 말 것 */
  onFrame?: (p: number, el: HTMLElement) => void;
  /** 기록할 CSS 변수 이름. 기본 "--p".
   *  커스텀 프로퍼티는 상속되므로, 섹션을 감싸는 바깥 요소는 반드시 다른 이름을 써야 한다 —
   *  안 그러면 섹션 밖 자손(히어로 같은)이 바깥 값을 물려받는다 */
  varName?: string;
}

type FrameRef = { current: ScrollProgressOptions["onFrame"] };
interface Entry { el: HTMLElement; span: ProgressSpan; varName: string; onFrame: FrameRef }

/** 지금 화면에 있는 섹션들. 루프는 이 집합이 비면 저절로 멈춘다 */
const active = new Set<Entry>();
/** 예약된 rAF 핸들. null 이면 루프가 자고 있다. 0 이 유효 핸들일 수 있어 null 을 센티널로 쓴다 */
let handle: number | null = null;

function progressOf(el: HTMLElement, span: ProgressSpan): number {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  // "cover" 는 요소가 뷰포트보다 클 때만 성립한다. 같거나 작으면 total 이 1px 로 눌려
  // 스크롤 1px 에 0→1 로 튄다. 그럴 때는 "enter" 로 떨어뜨린다
  const covers = span === "cover" && r.height > vh;
  const total = covers ? r.height - vh : r.height + vh;
  const passed = covers ? -r.top : vh - r.top;
  return Math.min(1, Math.max(0, passed / total));
}

function apply(el: HTMLElement, p: number, varName: string, onFrame: ScrollProgressOptions["onFrame"]): void {
  el.style.setProperty(varName, p.toFixed(3));
  onFrame?.(p, el);
}

function tick(): void {
  handle = null;
  for (const e of active) apply(e.el, progressOf(e.el, e.span), e.varName, e.onFrame.current);
  wake();
}

function wake(): void {
  if (handle === null && active.size > 0) handle = requestAnimationFrame(tick);
}

/** 섹션 요소에 스크롤 진행값 --p(0..1)를 매 프레임 직접 쓴다. React 는 리렌더하지 않는다.
 *  rAF 루프는 이 모듈에 하나뿐이다 — 섹션 열넷이 각자 돌면 안 된다 (4단계 설계 7장).
 *  표현은 전부 landing.css 가 --p 를 읽어서 한다 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  options: ScrollProgressOptions = {},
): void {
  const { rest = 1, span = "enter", onFrame, varName = "--p" } = options;
  const latest = useRef(onFrame);
  useEffect(() => {
    latest.current = onFrame;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) {
      apply(el, rest, varName, latest.current);
      return;
    }
    const entry: Entry = { el, span, varName, onFrame: latest };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((x) => x.isIntersecting)) {
          active.add(entry);
          wake();
        } else {
          active.delete(entry);
        }
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      active.delete(entry);
      if (active.size === 0 && handle !== null) {
        cancelAnimationFrame(handle);
        handle = null;
      }
    };
  }, [ref, rest, span, varName]);
}
