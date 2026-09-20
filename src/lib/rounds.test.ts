import { describe, expect, it } from "vitest";
import { getConfig } from "@/demo/adapter";
import { roundsOf } from "./rounds";

const config = getConfig();
const modOf = (key: string) => config.modules.find((m) => m.key === key)!;

describe("roundsOf", () => {
  it("MSI 문자를 라운드 키로 바꾼다", () => {
    expect(roundsOf(modOf("cal"))).toEqual(["0", "1", "2"]);
    expect(roundsOf(modOf("seas"))).toEqual(["1", "2"]);
    expect(roundsOf(modOf("vkospi"))).toEqual(["0"]);
  });
  it("모르는 글자는 버린다", () => {
    expect(roundsOf({ ...modOf("cal"), rounds: "MXI" })).toEqual(["0", "2"]);
  });
});
