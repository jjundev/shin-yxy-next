import { beforeEach, describe, expect, it } from "vitest";
import { defaultRequest } from "./adapter";
import * as gen from "./generated/adapter";
import { getSaved, listSaved, resetSaved, saveExperiment, SEED_ASOFS } from "./saved";
import { experimentVerdict, selectedHits } from "./verdict";

beforeEach(() => resetSaved());

describe("saved store", () => {
  it("시드 예시 셋으로 시작한다", () => {
    const list = listSaved();
    expect(list.map((s) => s.request.asOf)).toEqual([...SEED_ASOFS]);
  });

  it("시드 셋은 성공, 실패, 하나만 맞은 성공이다", () => {
    const [a, b, c] = listSaved();
    expect(experimentVerdict(a.result)).toBe("SUCCESS");
    expect(selectedHits(a.result.round2.estimates)).toEqual({ hits: 3, total: 3 });
    expect(experimentVerdict(b.result)).toBe("FAIL");
    expect(experimentVerdict(c.result)).toBe("SUCCESS");
    expect(selectedHits(c.result.round2.estimates).hits).toBeLessThanOrEqual(1);
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
});
