import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInView } from "./use-in-view";

type Entry = { isIntersecting: boolean };
type Cb = (entries: Entry[]) => void;
const made: { cb: Cb; disconnected: boolean }[] = [];

function stubIO() {
  made.length = 0;
  vi.stubGlobal("IntersectionObserver", class {
    constructor(cb: Cb) { made.push({ cb, disconnected: false }); }
    observe() {}
    disconnect() { made[made.length - 1].disconnected = true; }
  });
}

function Probe({ enabled, onSeen }: { enabled: boolean; onSeen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useInView(ref, enabled, onSeen);
  return <div ref={ref} />;
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
