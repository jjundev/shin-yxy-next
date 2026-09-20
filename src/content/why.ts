import type { LabConfig, RunRequest, RunResult } from "@/demo/types";
import type { Term } from "./labels";
import { SIMULATIONS } from "./constants";
import { roundsOf } from "@/lib/rounds";

export interface WhyStep {
  n: string;
  head: string;
  body: string;
  foot: string;
}

/** 세 라운드에서 켜져 있고(on 또는 filter), 구현돼 있고, 기준일에 데이터가 있는 모듈의 합집합 크기 */
function enabledModuleCount(config: LabConfig, request: RunRequest): number {
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

/** 원본 "이 숫자는 어떻게 나오나" */
export function whyCalc(
  config: LabConfig,
  request: RunRequest,
  result: RunResult | null,
): { steps: WhyStep[]; closing: string } {
  const sims = SIMULATIONS.toLocaleString("en-US");
  const sectors = 11; // 결과가 없을 때 원본이 보여 주는 값
  return {
    steps: [
      {
        n: "1", head: "모은다",
        body: "그날 이미 알려져 있던 것만 모은다 — 일정·계절·핵심 뉴스의 방향. 나중에 알려진 일은 쓰지 않는다. 그걸 쓰면 과거로 돌려 본 성적이 통째로 거짓이 된다.",
        foot: `켠 재료 ${enabledModuleCount(config, request)}개`,
      },
      {
        n: "2", head: "굴린다",
        body: `앞으로 하루하루 값이 어떻게 될지를 ${sims}번 그려 본다. 시장을 먼저 그리고, 그 답을 업종의 출발점으로, 업종의 답을 다시 그 업종 1등 종목의 출발점으로 넘긴다. 뉴스 몫은 앞 며칠에 몰린다.`,
        foot: `시장 → 업종 ${result?.round1.estimates.length ?? sectors} → 1등 종목 ${result?.round2.estimates.length ?? sectors}`,
      },
      {
        n: "3", head: "남는다",
        body: "남은 길로 날짜별 예상 중앙과 범위를 낸다. 「열에 여덟」은 앞으로 열 번 중 여덟 번은 이 안에서 끝난다고 보는 자리라는 뜻이다.",
        foot: result
          ? `업종 ${result.round1.estimates.filter((e) => e.selected).length}개 뽑음`
          : "돌리면 나온다",
      },
    ],
    closing: "나온 범위는 「앞으로 이렇게 될 것이다」가 아니라 「지금 아는 것으로는 이만큼밖에 못 좁힌다」는 말이다. 기준 시점을 과거로 밀면 그때 알던 것만으로 다시 돌려서 실제와 맞춰 본다.",
  };
}

/** 원본 경로 차트 캡션과 표 꼬리 */
export const WHY_PICKS = {
  legendActual: "선 하나가 대상 하나의 실제 움직임, 굵은 선이 집중한 대상, 음영이 그 80% 예상 범위다.",
  legendRolled: (n: number) => `옅은 선은 기준일에 굴린 길 ${n}개(회색 파선은 체에 걸려 버린 길), 음영은 80% 예상 범위다.`,
  band: "예상 중앙과 범위는 서버가 날짜마다 편 것이다 — 뉴스 영향은 앞 며칠에 몰리고(반감 5거래일) 나머지는 직선으로 벌어진다. 끝 날의 범위가 업종 표의 80% 범위와 같다.",
  glossary: ["굴린 길", "뽑음", "안 뽑음"] as Term[],
};

/** 원본 "확신도와 채점, 어떻게 나온 숫자인가" + 스펙 7.4 판정 규칙 */
export const WHY_VERDICT = {
  title: "확신도와 채점, 어떻게 나온 숫자인가",
  items: [
    { term: "예상 · 범위", body: (asOf: string) => `기준일 ${asOf} 장 마감 시점에 아는 것만으로 낸 확인 기간 뒤 수익률. 재료마다 "얼마나 미나" 는 기준일 직전 창에서 스스로 배운 계수로 정한다 — 사람이 박은 숫자가 아니다. 범위는 열에 여덟이 그 안에서 끝나는 구간(80% 범위)이다.` },
    { term: "확신도 0.82", body: () => "(내 예상 − 윗층 예상) ÷ 범위 폭. 업종은 시장보다, 종목은 자기 업종보다 얼마나 확실히 높나다. 예상값이 커도 폭이 넓으면 작아진다. 뽑는 순서가 곧 이 값이다." },
    { term: "크게 민 재료", body: () => "그 예상값을 가장 많이 움직인 재료 셋과 각각의 몫(%). 방향잡기는 더하기라 이 목록이 예상값의 출처다." },
    { term: "채점", body: () => "확인 기간이 지나면 실제 수익률을 옆에 붙인다. 시장·업종 11개·종목 후보 전부 — 뽑은 것만이 아니다. 안 틀림 = 방향도 맞고 범위 안. 틀렸으면 원인(출발점·방향·범위)과 가장 크게 반대로 민 재료를 적어 둔다." },
    { term: "업종 \"실제\" 순위", body: () => "그 기간 실제 업종지수 수익률로 다시 매긴 순위. 예측 순위와 나란히 놓으면 얼마나 어긋났는지 바로 보인다." },
  ],
  rule: "판정은 업종 층에서 센다. 방향이 맞고 80% 범위 안이면 성공, 방향만 맞으면 방향만 맞음, 방향이 틀리면 실패다. 실험 전체는 확인 기간이 다 지났고 평균 수익률에서 시장 수익률을 뺀 값이 0 이상이면 예상 성공, 음수면 예상 실패, 기간이 안 지났으면 채점 전이다.",
};
