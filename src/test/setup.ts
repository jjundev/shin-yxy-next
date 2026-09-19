import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest globals 를 끄고 쓰므로 Testing Library 의 자동 정리가 걸리지 않는다. 직접 건다.
afterEach(cleanup);

// jsdom 에는 ResizeObserver 가 없다. Radix 의 팝퍼(툴팁, 드롭다운, 시트)가 뜰 때 이걸 찾는다.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
