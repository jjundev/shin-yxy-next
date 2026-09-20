import { beforeEach, describe, expect, it } from "vitest";
import { defaultRequest } from "./adapter";
import * as gen from "./generated/adapter";
import {
  getSaved, listSaved, resetSaved, saveExperiment, SEED_ASOFS, subscribeSaved,
} from "./saved";
import { experimentVerdict, selectedHits } from "./verdict";

beforeEach(() => resetSaved());

describe("saved store", () => {
  it("시드 예시 셋으로 시작한다", () => {
    const list = listSaved();
    expect(list.map((s) => s.request.asOf)).toEqual([...SEED_ASOFS]);
  });

  it("시드 셋은 성공(하나 맞음), 실패, 성공(둘 맞음)이다", () => {
    const [a, b, c] = listSaved();
    expect(experimentVerdict(a.result)).toBe("SUCCESS");
    expect(selectedHits(a.result.round1.estimates)).toEqual({ hits: 1, total: 3 });
    expect(experimentVerdict(b.result)).toBe("FAIL");
    expect(experimentVerdict(c.result)).toBe("SUCCESS");
    expect(selectedHits(c.result.round1.estimates).hits).toBe(2);
  });

  it("저장하면 맨 위에 쌓이고 id 로 찾는다", () => {
    const req = defaultRequest();
    const saved = saveExperiment(req, gen.runLab(req), new Date("2026-09-19T10:00:00Z"));
    expect(listSaved()[0].id).toBe(saved.id);
    expect(listSaved()).toHaveLength(4);
    expect(getSaved(saved.id)?.request.asOf).toBe("2026-01-15");
    expect(getSaved("nope")).toBeUndefined();
  });

  it("reset 하면 시드로 돌아온다", () => {
    const req = defaultRequest();
    saveExperiment(req, gen.runLab(req));
    resetSaved();
    expect(listSaved()).toHaveLength(3);
  });

  it("저장하면 구독자에게 알리고, 해지하면 안 알린다", () => {
    const calls: number[] = [];
    const off = subscribeSaved(() => calls.push(listSaved().length));
    const req = defaultRequest();
    saveExperiment(req, gen.runLab(req));
    expect(calls).toEqual([4]);
    off();
    saveExperiment(req, gen.runLab(req));
    expect(calls).toEqual([4]);
  });

  it("저장은 요청과 결과를 복사해 둔다", () => {
    const req = defaultRequest();
    const saved = saveExperiment(req, gen.runLab(req));
    req.asOf = "2020-01-01";
    expect(saved.request.asOf).toBe("2026-01-15");
    expect(saved.request).not.toBe(req);
  });

  it("reset 뒤에도 새 저장 id 는 이전 id 와 겹치지 않는다", () => {
    const req = defaultRequest();
    const a = saveExperiment(req, gen.runLab(req));
    resetSaved();
    const b = saveExperiment(req, gen.runLab(req));
    expect(b.id).not.toBe(a.id);
  });
});
