import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInView, type InViewOptions } from "./use-in-view";

type Entry = { isIntersecting: boolean };
type Cb = (entries: Entry[]) => void;
const made: { cb: Cb; disconnected: boolean; observed: Element[] }[] = [];

function stubIO() {
  made.length = 0;
  vi.stubGlobal("IntersectionObserver", class {
    self: { cb: Cb; disconnected: boolean; observed: Element[] };
    constructor(cb: Cb) {
      this.self = { cb, disconnected: false, observed: [] };
      made.push(this.self);
    }
    observe(el: Element) { this.self.observed.push(el); }
    disconnect() { this.self.disconnected = true; }
  });
}

function Probe({ enabled, onSeen, options }: { enabled: boolean; onSeen: () => void; options?: InViewOptions }) {
  const ref = useRef<HTMLDivElement>(null);
  useInView(ref, enabled, onSeen, options);
  return (
    <div ref={ref}>
      <span data-slot="inner" />
    </div>
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("useInView", () => {
  it("보이면 한 번 부르고 관찰을 끝낸다", () => {
    stubIO();
    const onSeen = vi.fn();
    render(<Probe enabled onSeen={onSeen} />);
    expect(made).toHaveLength(1);
    act(() => made[0].cb([{ isIntersecting: false }]));
    expect(onSeen).not.toHaveBeenCalled();
    act(() => made[0].cb([{ isIntersecting: true }]));
    expect(onSeen).toHaveBeenCalledTimes(1);
    expect(made[0].disconnected).toBe(true);
  });
  it("기본은 ref 요소 그대로 관찰한다", () => {
    stubIO();
    render(<Probe enabled onSeen={() => {}} />);
    expect(made[0].observed).toHaveLength(1);
    expect(made[0].observed[0].getAttribute("data-slot")).toBeNull();
  });
  it("select 가 고른 안쪽 요소를 관찰한다", () => {
    stubIO();
    render(<Probe enabled onSeen={() => {}} options={{ select: (root) => root.querySelector('[data-slot="inner"]') }} />);
    expect(made[0].observed).toHaveLength(1);
    expect(made[0].observed[0].getAttribute("data-slot")).toBe("inner");
  });
  it("select 가 못 찾으면 ref 요소로 돌아간다", () => {
    stubIO();
    render(<Probe enabled onSeen={() => {}} options={{ select: (root) => root.querySelector('[data-slot="nope"]') }} />);
    expect(made[0].observed[0].tagName).toBe("DIV");
  });
  it("enabled 가 아니면 관찰하지 않는다", () => {
    stubIO();
    render(<Probe enabled={false} onSeen={() => {}} />);
    expect(made).toHaveLength(0);
  });
  it("IntersectionObserver 가 없으면 조용히 아무것도 안 한다", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    expect(() => render(<Probe enabled onSeen={() => {}} />)).not.toThrow();
  });
});
