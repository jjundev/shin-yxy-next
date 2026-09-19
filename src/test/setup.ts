import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest globals 를 끄고 쓰므로 Testing Library 의 자동 정리가 걸리지 않는다. 직접 건다.
afterEach(cleanup);
