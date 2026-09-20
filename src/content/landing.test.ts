import { describe, expect, it } from "vitest";
import { landing } from "./landing";
import { strings } from "./strings";
import { HORIZON_CHOICES, FIXED_AS_OF, FIXED_HORIZON_DAYS } from "./constants";

describe("landing copy", () => {
  it("약속 문장을 다시 쓰지 않는다 — 히어로가 strings.landing 을 그대로 쓴다", () => {
    const flat = JSON.stringify(landing);
    expect(flat).not.toContain(strings.landing.promise);
    expect(flat).not.toContain(strings.landing.sub);
  });

  it("CTA 이름 여섯이 서로 다르다 — getByRole(name) 은 완전일치 + strict 다", () => {
    const names = [
      strings.landing.start, landing.header.start, landing.cta.start,   // 로그아웃
      strings.landing.toLab, landing.header.toLab, landing.cta.toLab,   // 로그인
    ];
    expect(new Set(names).size).toBe(6);
  });

  it("경계 섹션은 세 줄이다", () => {
    expect(landing.limits.items).toHaveLength(3);
  });

  it("세 그림의 이름이 서로 다르다 — getByRole(\"img\") 이 하나만 잡아야 한다", () => {
    const names = [
      landing.hero.stackLabel,
      landing.cascade.layers.join(" · "),
      landing.cta.stackLabel,
    ];
    expect(new Set(names).size).toBe(3);
  });

  it("4,000 대 24 를 문구로 밝힌다", () => {
    expect(landing.roll.honest).toContain("4,000");
    expect(landing.roll.honest).toContain("24");
  });

  it("체 비율은 비율이라고 밝힌다 — 고정 시드의 표본 24개는 전부 KEPT 다", () => {
    const line = landing.roll.accept("72%", 7, 24);
    expect(line).toContain("72%");
    expect(line).toContain("비율");
  });

  it("섹션 리드 셋은 안내 카드 본문의 앞부분과 정확히 같다", () => {
    // 뒤에 붙은 "왼쪽에서 …해 보라" 만 뺀 것이다. 안내 문구가 바뀌면 여기서 걸린다
    const steps = strings.lab.guide.steps;
    expect(steps[0].body.startsWith(landing.moment.lead)).toBe(true);
    expect(steps[1].body.startsWith(landing.gather.lead)).toBe(true);
    expect(steps[2].body.startsWith(landing.roll.lead)).toBe(true);
  });

  it("두 시점 섹션의 숫자는 공용 상수에서 온다", () => {
    expect(landing.moment.stats[1].value).toBe(String(HORIZON_CHOICES.length));
  });
});

describe("fixed seed constants", () => {
  it("상위 스펙 5.4 의 고정 입력", () => {
    expect(FIXED_AS_OF).toBe("2026-01-15");
    expect(FIXED_HORIZON_DAYS).toBe(20);
  });
  it("확인 기간 네 칩", () => {
    expect(HORIZON_CHOICES).toEqual([1, 5, 10, 20]);
  });
});
