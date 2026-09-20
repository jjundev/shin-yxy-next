import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearOnboarded, isOnboarded, setOnboarded } from "./onboarded";

beforeEach(() => localStorage.clear());

describe("onboarded", () => {
  it("처음엔 안 봤고, 세팅하면 봤고, 지우면 다시 안 봤다", () => {
    expect(isOnboarded()).toBe(false);
    setOnboarded();
    expect(localStorage.getItem("shin.onboarded")).toBe("1");
    expect(isOnboarded()).toBe(true);
    clearOnboarded();
    expect(isOnboarded()).toBe(false);
  });
  it("저장소가 던지면 봤다고 친다 (안내가 화면을 막지 않게)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(isOnboarded()).toBe(true);
    expect(() => setOnboarded()).not.toThrow();
    vi.restoreAllMocks();
  });
});
