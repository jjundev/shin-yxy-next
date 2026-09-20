import { describe, expect, it } from "vitest";
import { defaultRequest, getConfig } from "@/demo/adapter";
import * as gen from "@/demo/generated/adapter";
import { strings } from "./strings";
import { REMAIN_BODY, WHY_PICKS, WHY_VERDICT, whyCalc } from "./why";
import { SIMULATIONS } from "./constants";

describe("whyCalc", () => {
  const config = getConfig();
  const req = defaultRequest();
  it("세 단계와 꼬리 숫자를 낸다", () => {
    const w = whyCalc(config, req, gen.runLab(req));
    expect(w.steps.map((s) => s.head)).toEqual(["재료 모으기", "시뮬레이션", "범위 도출"]);
    expect(w.steps[0].foot).toBe("켠 재료 8개");
    expect(w.steps[1].foot).toBe("시장 → 업종 11 → 1등 종목 11");
    expect(w.steps[2].foot).toBe("업종 3개 선정");
  });
  it("결과가 없으면 셋째 꼬리는 돌리면 나온다", () => {
    expect(whyCalc(config, req, null).steps[2].foot).toBe("돌리면 나와요");
  });
  it("2016-01-15 기준이면 변동성지수(2016-02-01 시작)는 안 센다", () => {
    expect(whyCalc(config, { ...req, asOf: "2016-01-15" }, null).steps[0].foot).toBe("켠 재료 7개");
  });
});

describe("나머지 패널", () => {
  it("범례와 용어가 있다", () => {
    expect(WHY_PICKS.legendRolled(24)).toContain("시뮬레이션한 24개 경로");
    expect(WHY_PICKS.glossary).toEqual(["굴린 길", "뽑음", "안 뽑음"]);
    expect(WHY_VERDICT.items).toHaveLength(5);
    expect(SIMULATIONS).toBe(4000);
  });
  it("실험실 문구가 있다", () => {
    expect(strings.lab.when.run).toBe("계산하기");
    expect(strings.lab.summary.earnedMore).toBe("더 벌었어요");
    expect(strings.lab.verdict.pick.belowStart).toBe("내릴 듯");
  });
});

describe("REMAIN_BODY", () => {
  it("whyCalc 3단계 본문과 같은 문장이다", () => {
    expect(REMAIN_BODY).toContain("10번 중 8번");
    expect(whyCalc(getConfig(), defaultRequest(), null).steps[2].body).toBe(REMAIN_BODY);
  });
});
