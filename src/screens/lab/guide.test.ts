import { describe, expect, it } from "vitest";
import { strings } from "@/content/strings";
import { GUIDE_STEPS, advanceGuide } from "./guide";

describe("GUIDE_STEPS", () => {
  it("네 단계, 문구와 짝이 맞고, 다섯 용어가 한 번씩 나온다", () => {
    expect(GUIDE_STEPS).toHaveLength(4);
    expect(strings.lab.guide.steps).toHaveLength(4);
    expect(GUIDE_STEPS.map((s) => s.why)).toEqual(["verdict", "summary", "summary", "verdict"]);
    expect(GUIDE_STEPS.flatMap((s) => s.terms).sort()).toEqual(["굴린 길", "돈의 흐름", "뽑음", "안 뽑음", "재료", "판독"].sort());
    expect(GUIDE_STEPS[0].dim).toEqual({ ingredients: true });
    expect(GUIDE_STEPS[1].dim).toEqual({ when: true });
    expect(GUIDE_STEPS[3].dim).toEqual({});
  });
});

describe("advanceGuide (스펙 5.3)", () => {
  it("지금 단계의 조건을 채우면 다음으로, 4를 채우면 끝", () => {
    expect(advanceGuide(1, 1)).toBe(2);
    expect(advanceGuide(2, 2)).toBe(3);
    expect(advanceGuide(3, 3)).toBe(4);
    expect(advanceGuide(4, 4)).toBeNull();
  });
  it("앞 단계 조건을 뒤늦게 채워도 뒤로 안 간다", () => {
    expect(advanceGuide(3, 1)).toBe(3);
    expect(advanceGuide(4, 2)).toBe(4);
  });
  it("순서를 건너뛰면 그 단계까지 완료로 치고 다음으로", () => {
    expect(advanceGuide(1, 3)).toBe(4);
    expect(advanceGuide(2, 3)).toBe(4);
    expect(advanceGuide(1, 2)).toBe(3);
  });
  it("안내가 아니면 그대로 null", () => {
    expect(advanceGuide(null, 1)).toBeNull();
    expect(advanceGuide(null, 4)).toBeNull();
  });
});
