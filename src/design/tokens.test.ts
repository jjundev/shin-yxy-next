// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

const REQUIRED = [
  "--background", "--foreground", "--card", "--card-foreground", "--popover", "--popover-foreground",
  "--primary", "--primary-foreground", "--secondary", "--secondary-foreground", "--muted",
  "--muted-foreground", "--accent", "--accent-foreground", "--destructive", "--border", "--input",
  "--ring", "--up", "--down", "--flat", "--chart", "--chart-wash",
];

function block(selector: string): string {
  const i = css.indexOf(selector + " {");
  expect(i, `${selector} block`).toBeGreaterThanOrEqual(0);
  return css.slice(i, css.indexOf("}", i));
}

describe("tokens.css", () => {
  it("라이트와 다크가 같은 변수를 정의한다", () => {
    const light = block(":root");
    const dark = block(".dark");
    for (const v of REQUIRED) {
      expect(light, `${v} in :root`).toContain(v + ":");
      expect(dark, `${v} in .dark`).toContain(v + ":");
    }
  });
  it("라운드와 폭은 스펙 값", () => {
    const light = block(":root");
    expect(light).toContain("--radius: 8px");
    expect(light).toContain("--content-width: 720px");
    expect(light).toContain("--wide-width: 1200px");
  });
});
