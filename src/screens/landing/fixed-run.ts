import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/client";
import { FIXED_AS_OF, FIXED_HORIZON_DAYS } from "@/content/constants";
import type { RunResult } from "@/demo/types";

export type FixedRun =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; result: RunResult };

/** 랜딩의 증거·굴림·층·판정 섹션이 같이 쓰는 한 번의 계산.
 *  생성기는 입력에 대해 결정적이고 13ms 만에 끝난다 — 지연을 0 으로 두면 로딩이 보이지 않는다.
 *  config 가 바뀌어도 증거가 움직이지 않도록 기준 시점과 확인 기간은 상수로 덮는다 (상위 스펙 5.4) */
export function useFixedRun(): { run: FixedRun; retry: () => void } {
  const [run, setRun] = useState<FixedRun>({ status: "loading" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .config()
      .then((config) =>
        api.run(
          { ...api.defaultRequest(config), asOf: FIXED_AS_OF, horizonDays: FIXED_HORIZON_DAYS },
          { delayMs: 0 },
        ),
      )
      .then(
        (result) => {
          if (alive) setRun({ status: "ok", result });
        },
        () => {
          if (alive) setRun({ status: "error" });
        },
      );
    return () => {
      alive = false;
    };
  }, [tick]);

  /** 다시 시도는 누른 자리에서 loading 으로 되돌린다(effect 안에서 하면 연쇄 렌더) */
  const retry = useCallback(() => {
    setRun({ status: "loading" });
    setTick((n) => n + 1);
  }, []);

  return { run, retry };
}
