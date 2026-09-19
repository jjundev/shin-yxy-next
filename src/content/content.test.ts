import { describe, expect, it } from "vitest";
import extracted from "./extracted.json";
import { strings } from "./strings";
import { label, TERM_GLOSSARY, TERM_LABELS } from "./labels";

describe("extracted strings", () => {
  it("원본 문구가 충분히 뽑혔다", () => {
    expect(extracted.length).toBeGreaterThan(900);
    expect(extracted).toContain("예상 성공");
    expect(extracted).toContain("계산하기");
    expect(extracted.every((s) => s.length <= 200)).toBe(true);
  });
});

describe("labels", () => {
  it("다섯 용어를 표준 라벨로 바꾼다", () => {
    expect(label("굴린 길")).toBe("시뮬레이션 경로");
    expect(label("뽑음")).toBe("선정");
    expect(label("안 뽑음")).toBe("미선정");
    expect(label("판독")).toBe("뉴스 판독");
    expect(label("재료")).toBe("입력 재료");
    expect(label("돈의 흐름")).toBe("자금 흐름");
  });
  it("모든 용어에 풀이가 있다", () => {
    for (const term of Object.keys(TERM_LABELS)) {
      expect(TERM_GLOSSARY[term as keyof typeof TERM_GLOSSARY].length).toBeGreaterThan(10);
    }
  });
});

describe("strings", () => {
  it("앱 이름과 데모 표시는 원본 그대로", () => {
    expect(strings.appName).toBe("주식 길잡이 실험실");
    expect(strings.demoBadge).toBe("데모 · 데이터는 무작위");
    expect(strings.nav.lab).toBe("실험실");
    expect(strings.nav.saved).toBe("저장소");
  });
  it("판정 라벨이 내용 층에 있다", () => {
    expect(strings.verdict.SUCCESS).toBe("예상 성공");
    expect(strings.subjectVerdict.DIRECTION_ONLY).toBe("방향만 맞음");
  });
});
