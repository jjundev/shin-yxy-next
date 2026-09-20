import type { LabConfig, RunRequest, RunResult } from "@/demo/types";
import type { Term } from "./labels";
import { SIMULATIONS_LABEL } from "./constants";
import { roundsOf } from "@/lib/rounds";

export interface WhyStep {
  n: string;
  head: string;
  body: string;
  foot: string;
}

/** 세 라운드에서 켜져 있고(on 또는 filter), 구현돼 있고, 기준일에 데이터가 있는 모듈의 합집합 크기 */
export function enabledModuleCount(config: LabConfig, request: RunRequest): number {
  const keys = new Set<string>();
  for (const m of config.modules) {
    if (!m.implemented) continue;
    if (m.dataStart !== null && m.dataStart > request.asOf) continue;
    for (const r of roundsOf(m)) {
      const s = request.rounds[r].modules[m.key];
      if (s && (s.on || s.filter)) keys.add(m.key);
    }
  }
  return keys.size;
}

/** 원본 3단계 "남는다" 본문. 랜딩 S7 이 같은 문장을 쓴다 — 두 벌 두지 않는다 */
export const REMAIN_BODY =
  "남은 경로들로 날짜별 예상 중앙값과 80% 신뢰 구간을 계산해요. 10번 중 8번은 이 안에서 움직일 것으로 기대하는 범위예요.";

/** 원본 "이 숫자는 어떻게 나오나" */
export function whyCalc(
  config: LabConfig,
  request: RunRequest,
  result: RunResult | null,
): { steps: WhyStep[]; closing: string } {
  const sectors = 11; // 결과가 없을 때 원본이 보여 주는 값
  return {
    steps: [
      {
        n: "1", head: "재료 모으기",
        body: "기준일 당시에 이미 알려져 있던 일정, 계절성, 핵심 뉴스 방향만 모아요. 나중에 알려진 정보는 예측의 객관성을 위해 전혀 사용하지 않아요.",
        foot: `켠 재료 ${enabledModuleCount(config, request)}개`,
      },
      {
        n: "2", head: "시뮬레이션",
        body: `앞으로의 가격 경로를 하루 단위로 ${SIMULATIONS_LABEL}번 그려봐요. 시장 전체를 먼저 시뮬레이션하고, 그 결과를 업종과 1등 종목으로 차례대로 넘겨요. 뉴스의 영향은 초기 며칠에 집중돼요.`,
        foot: `시장 → 업종 ${result?.round1.estimates.length ?? sectors} → 1등 종목 ${result?.round2.estimates.length ?? sectors}`,
      },
      {
        n: "3", head: "범위 도출",
        body: REMAIN_BODY,
        foot: result
          ? `업종 ${result.round1.estimates.filter((e) => e.selected).length}개 선정`
          : "돌리면 나와요",
      },
    ],
    closing: "도출된 범위는 ‘반드시 이렇게 된다’는 확정이 아니라, ‘현재 알 수 있는 정보로는 이 범위까지 좁힐 수 있다’는 뜻이에요. 기준 시점을 과거로 옮기면 그때의 정보만으로 다시 계산해 실제 결과와 맞춰볼 수 있어요.",
  };
}

/** 원본 경로 차트 캡션과 표 꼬리 */
export const WHY_PICKS = {
  legendActual: "얇은 선은 대상 하나의 실제 움직임, 굵은 선은 선택한 대상, 음영 영역은 80% 예상 범위예요.",
  legendRolled: (n: number) => `옅은 선은 기준일에 시뮬레이션한 ${n}개 경로(회색 점선은 필터링된 경로), 음영 영역은 80% 예상 범위예요.`,
  band: "예상 중앙값과 범위는 날짜별로 계산된 결과예요. 뉴스 영향은 초기에 집중되고(반감 5거래일) 이후에는 점차 넓어져요. 마지막 날의 범위가 업종 표의 80% 범위와 같아요.",
  glossary: ["굴린 길", "뽑음", "안 뽑음"] as Term[],
};

/** 원본 "확신도와 채점, 어떻게 나온 숫자인가" + 스펙 7.4 판정 규칙 */
export const WHY_VERDICT = {
  title: "확신도와 판정, 어떻게 계산되었을까요?",
  items: [
    { term: "예상 · 범위", body: (asOf: string) => `기준일 ${asOf} 장 마감 시점에 아는 것만으로 낸 확인 기간 뒤 수익률. 재료마다 "얼마나 미나" 는 기준일 직전 창에서 스스로 배운 계수로 정한다 — 사람이 박은 숫자가 아니다. 범위는 열에 여덟이 그 안에서 끝나는 구간(80% 범위)이다.` },
    { term: "확신도 0.82", body: () => "(내 예상 − 윗층 예상) ÷ 범위 폭. 업종은 시장보다, 종목은 자기 업종보다 얼마나 확실히 높나다. 예상값이 커도 폭이 넓으면 작아진다. 뽑는 순서가 곧 이 값이다." },
    { term: "크게 민 재료", body: () => "그 예상값을 가장 많이 움직인 재료 셋과 각각의 몫(%). 방향잡기는 더하기라 이 목록이 예상값의 출처다." },
    { term: "채점", body: () => "확인 기간이 지나면 실제 수익률을 옆에 붙인다. 시장·업종 11개·종목 후보 전부 — 뽑은 것만이 아니다. 안 틀림 = 방향도 맞고 범위 안. 틀렸으면 원인(출발점·방향·범위)과 가장 크게 반대로 민 재료를 적어 둔다." },
    { term: "업종 \"실제\" 순위", body: () => "그 기간 실제 업종지수 수익률로 다시 매긴 순위. 예측 순위와 나란히 놓으면 얼마나 어긋났는지 바로 보인다." },
  ],
  rule: "판정은 업종 층에서 진행돼요. 방향이 맞고 80% 범위 안이면 성공, 방향만 맞으면 방향만 맞음, 방향이 어긋나면 실패예요. 실험 전체는 확인 기간이 지나고 평균 수익률이 시장 대비 0 이상이면 예상 성공, 낮으면 예상 실패로 판정돼요.",
};
