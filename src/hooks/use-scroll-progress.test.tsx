import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useScrollProgress, type ScrollProgressOptions } from "./use-scroll-progress";

type IoEntry = { isIntersecting: boolean };
type Cb = (entries: IoEntry[]) => void;

const made: { cb: Cb; disconnected: boolean }[] = [];
let frames: FrameRequestCallback[] = [];
let cancelled = 0;

function stubAll(reduced = false) {
  made.length = 0;
  frames = [];
  cancelled = 0;
  vi.stubGlobal("IntersectionObserver", class {
    self: { cb: Cb; disconnected: boolean };
    constructor(cb: Cb) {
      this.self = { cb, disconnected: false };
      made.push(this.self);
    }
    observe() {}
    disconnect() { this.self.disconnected = true; }
  });
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    frames.push(fn);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => { cancelled += 1; });
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: reduced, media: q, addEventListener: () => {}, removeEventListener: () => {},
  }));
  vi.stubGlobal("innerHeight", 1000);
}

/** 큐에 쌓인 프레임을 한 번 돌린다 */
function runFrame() {
  const queued = frames;
  frames = [];
  act(() => { for (const f of queued) f(0); });
}

function Probe({ options }: { options?: ScrollProgressOptions }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, options);
  return <div ref={ref} data-testid="s" />;
}

/** 높이 h 인 요소가 top 위치에 있다고 속인다 */
function place(el: HTMLElement, top: number, h = 500) {
  el.getBoundingClientRect = () => ({ top, height: h, bottom: top + h, left: 0, right: 0, width: 0, x: 0, y: top, toJSON: () => ({}) });
}

const p = (el: HTMLElement) => el.style.getPropertyValue("--p");

// 모듈 전역 rAF 루프가 다음 테스트로 새지 않도록 매번 비운다
afterEach(() => {
  for (let i = 0; i < 10 && frames.length > 0; i += 1) runFrame();
  vi.unstubAllGlobals();
});

describe("useScrollProgress", () => {
  it("IntersectionObserver 가 없으면 rest 를 쓰고 관찰하지 않는다", () => {
    stubAll();
    vi.stubGlobal("IntersectionObserver", undefined);
    const { getByTestId } = render(<Probe options={{ rest: 0.7 }} />);
    expect(p(getByTestId("s"))).toBe("0.700");
    expect(made).toHaveLength(0);
  });

  it("감속 모션이면 rest 를 쓰고 관찰하지 않는다", () => {
    stubAll(true);
    const { getByTestId } = render(<Probe options={{ rest: 0.4 }} />);
    expect(p(getByTestId("s"))).toBe("0.400");
    expect(made).toHaveLength(0);
  });

  it("rest 기본값은 1 이다", () => {
    stubAll();
    vi.stubGlobal("IntersectionObserver", undefined);
    const { getByTestId } = render(<Probe />);
    expect(p(getByTestId("s"))).toBe("1.000");
  });

  it("보이면 루프가 돌며 진행값을 쓴다", () => {
    stubAll();
    const { getByTestId } = render(<Probe />);
    const el = getByTestId("s");
    place(el, 1000);                       // 요소 위가 뷰포트 바닥 → 0
    act(() => made[0].cb([{ isIntersecting: true }]));
    runFrame();
    expect(p(el)).toBe("0.000");
    place(el, -500);                       // 요소 바닥이 뷰포트 위 → 1
    runFrame();
    expect(p(el)).toBe("1.000");
    place(el, 250);                        // (1000-250)/1500 = 0.5
    runFrame();
    expect(p(el)).toBe("0.500");
  });

  it("화면 밖으로 나가면 루프가 멈춘다", () => {
    stubAll();
    const { getByTestId } = render(<Probe />);
    place(getByTestId("s"), 250);
    act(() => made[0].cb([{ isIntersecting: true }]));
    runFrame();
    expect(frames.length).toBe(1);          // 다음 프레임이 예약돼 있다
    act(() => made[0].cb([{ isIntersecting: false }]));
    runFrame();
    expect(frames.length).toBe(0);          // 더는 예약하지 않는다
  });

  it("onFrame 이 매 프레임 진행값을 받는다", () => {
    stubAll();
    const onFrame = vi.fn();
    const { getByTestId } = render(<Probe options={{ onFrame }} />);
    place(getByTestId("s"), 250);
    act(() => made[0].cb([{ isIntersecting: true }]));
    runFrame();
    expect(onFrame).toHaveBeenCalledWith(0.5, getByTestId("s"));
  });

  it("언마운트하면 관찰을 끊고 남은 프레임을 취소한다", () => {
    stubAll();
    const { getByTestId, unmount } = render(<Probe />);
    place(getByTestId("s"), 250);
    act(() => made[0].cb([{ isIntersecting: true }]));
    runFrame();
    unmount();
    expect(made[0].disconnected).toBe(true);
    expect(cancelled).toBe(1);
  });

  it("cover 는 뷰포트보다 큰 요소가 화면을 덮는 동안으로 잰다", () => {
    stubAll();
    const { getByTestId } = render(<Probe options={{ span: "cover" }} />);
    const el = getByTestId("s");
    act(() => made[0].cb([{ isIntersecting: true }]));
    place(el, 0, 2000);          // 요소 위가 뷰포트 위 → 0
    runFrame();
    expect(p(el)).toBe("0.000");
    place(el, -1000, 2000);      // 1000 만큼 지나감 / (2000-1000) → 1
    runFrame();
    expect(p(el)).toBe("1.000");
    place(el, -500, 2000);
    runFrame();
    expect(p(el)).toBe("0.500");
  });

  it("cover 인데 요소가 뷰포트보다 짧으면 enter 처럼 잰다 — 1px 에 0→1 로 튀지 않는다", () => {
    stubAll();
    const { getByTestId } = render(<Probe options={{ span: "cover" }} />);
    const el = getByTestId("s");
    act(() => made[0].cb([{ isIntersecting: true }]));
    place(el, 1000, 500);        // 위가 뷰포트 바닥 → 0
    runFrame();
    expect(p(el)).toBe("0.000");
    place(el, -500, 500);        // 바닥이 뷰포트 위 → 1
    runFrame();
    expect(p(el)).toBe("1.000");
    place(el, 250, 500);         // (1000-250)/1500
    runFrame();
    expect(p(el)).toBe("0.500");
  });

  it("varName 으로 다른 변수에 쓴다 — 섹션의 --p 를 덮지 않게", () => {
    stubAll();
    const { getByTestId } = render(<Probe options={{ span: "cover", varName: "--page-p" }} />);
    const el = getByTestId("s");
    act(() => made[0].cb([{ isIntersecting: true }]));
    place(el, -500, 2000);
    runFrame();
    expect(el.style.getPropertyValue("--page-p")).toBe("0.500");
    expect(el.style.getPropertyValue("--p")).toBe("");
  });

  it("varName 은 rest 경로에도 적용된다", () => {
    stubAll();
    vi.stubGlobal("IntersectionObserver", undefined);
    const { getByTestId } = render(<Probe options={{ rest: 0, varName: "--page-p" }} />);
    expect(getByTestId("s").style.getPropertyValue("--page-p")).toBe("0.000");
    expect(getByTestId("s").style.getPropertyValue("--p")).toBe("");
  });
});
