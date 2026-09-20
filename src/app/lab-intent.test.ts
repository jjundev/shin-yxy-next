import { beforeEach, describe, expect, it } from "vitest";
import { listSaved } from "@/demo/saved";
import { clearLabIntent, peekLabIntent, setLabIntent } from "./lab-intent";

beforeEach(() => clearLabIntent());

describe("lab intent", () => {
  it("비어 있다가, 세팅하면 몇 번을 보든 그대로고, 지우면 빈다", () => {
    expect(peekLabIntent()).toBeNull();
    setLabIntent({ kind: "guide" });
    expect(peekLabIntent()).toEqual({ kind: "guide" });
    expect(peekLabIntent()).toEqual({ kind: "guide" });
    clearLabIntent();
    expect(peekLabIntent()).toBeNull();
  });
  it("열기 의도는 저장 항목을 그대로 든다", () => {
    const saved = listSaved()[0];
    setLabIntent({ kind: "open", saved });
    expect(peekLabIntent()).toEqual({ kind: "open", saved });
  });
});
