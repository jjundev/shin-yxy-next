import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultRequest } from "@/demo/adapter";
import * as gen from "@/demo/generated/adapter";
import { PathChart } from "./path-chart";

const result = gen.runLab(defaultRequest());
const layer1 = result.paths.subjects.filter((s) => s.round === 0 || s.round === 1);
const market = { round: 0 as const, subjectId: 0 };

describe("PathChart", () => {
  it("실제 모드: 대상 12개 선, 집중 대상은 굵은 선 + 음영", () => {
    const { container } = render(<PathChart dates={result.paths.dates} subjects={layer1} focus={market} mode="actual" />);
    expect(container.querySelectorAll('[data-kind="actual"]')).toHaveLength(11);
    expect(container.querySelectorAll('[data-kind="focus"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-kind="band"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-kind="sample"]')).toHaveLength(0);
  });

  it("집중을 바꾸면 굵은 선이 그 대상으로 간다", () => {
    const { container } = render(<PathChart dates={result.paths.dates} subjects={layer1} focus={{ round: 1, subjectId: 5 }} mode="actual" />);
    expect(container.querySelector('[data-kind="focus"]')?.getAttribute("data-subject")).toBe("1:5");
  });

  it("시뮬레이션 모드: 표본 길 24개", () => {
    const { container } = render(<PathChart dates={result.paths.dates} subjects={layer1} focus={{ round: 1, subjectId: 5 }} mode="rolled" />);
    expect(container.querySelectorAll('[data-kind="sample"], [data-kind="dropped"]')).toHaveLength(24);
    expect(container.querySelectorAll('[data-kind="focus"]')).toHaveLength(1);
  });

  it("실제가 없으면 예상 점선", () => {
    const noActual = layer1.map((s) => ({ ...s, actual: [] }));
    const { container } = render(<PathChart dates={result.paths.dates} subjects={noActual} focus={market} mode="actual" />);
    expect(container.querySelectorAll('[data-kind="expected"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-kind="actual"]')).toHaveLength(0);
  });
  it("체에 걸린 길은 회색 점선으로 갈린다", () => {
    const { container } = render(<PathChart dates={result.paths.dates} subjects={layer1} focus={{ round: 1, subjectId: 5 }} mode="rolled" />);
    expect(container.querySelectorAll('[data-kind="sample"]')).toHaveLength(24);
    expect(container.querySelectorAll('[data-kind="dropped"]')).toHaveLength(0);

    const cut = layer1.map((s) =>
      s.round === 1 && s.subjectId === 5 ? { ...s, fates: s.fates.map((f, i) => (i < 3 ? "CUT" : f)) } : s,
    );
    const { container: c2 } = render(<PathChart dates={result.paths.dates} subjects={cut} focus={{ round: 1, subjectId: 5 }} mode="rolled" />);
    expect(c2.querySelectorAll('[data-kind="sample"]')).toHaveLength(21);
    const dropped = c2.querySelectorAll('[data-kind="dropped"]');
    expect(dropped).toHaveLength(3);
    for (const el of dropped) expect(el).toHaveAttribute("stroke-dasharray", "3 3");
  });
});
