import { SIMULATIONS_LABEL, HORIZON_CHOICES } from "./constants";

/** 4단계 랜딩 전용 문구. 제목·헤드는 합니다체, 본문은 한다체(상위 스펙 3.4).
 *  약속 문장과 부제는 strings.landing 이 갖고 있다 — 여기서 다시 쓰지 않는다 */
export const landing = {
  skipToContent: "본문으로",
  scrollHint: "아래로",
  progressLabel: "읽은 만큼",

  /** CTA 이름 여섯 개(로그아웃 셋 · 로그인 셋)는 서로 달라야 한다.
   *  e2e 와 Testing Library 의 getByRole(name) 은 완전일치 + strict 다.
   *  히어로는 strings.landing.start / .toLab 을 그대로 쓴다("첫 실험 시작하기" / "실험실로") */
  header: { start: "시작하기", toLab: "실험실 가기" },

  hero: {
    stackLabel: "시장, 업종, 1등 종목 세 층이 겹쳐 있는 그림",
    auroraAlt: "푸른 광원과 미세한 격자가 깔린 추상 배경",
    /** 시장 층의 이름. 데이터의 이름("시장 (업종지수 동일가중)")은 층 딱지에 너무 길다 */
    marketName: "시장",
  },

  contrast: {
    title: "내일 무엇이 오를지 알려 주는 화면은 이미 많습니다",
    body: "그 화면들은 맞았는지를 알려 주지 않는다. 이 도구는 거꾸로 간다 — 과거의 하루를 골라, 그날 알 수 있던 것만 넣고, 이미 지나간 실제와 맞춰 본다.",
    theirs: "흔한 예측 화면",
    theirsFoot: "무엇이 오를지 말한다. 맞았는지는 말하지 않는다.",
    ours: "이 도구",
    oursFoot: "무엇이 오를지 말하고, 곧바로 채점한다.",
    imageAlt: "가상의 예측 앱 화면 — 종목 목록과 오를 확률만 있고 채점은 없다",
  },

  tunnel: {
    title: "그래서 과거의 하루로 돌아갑니다",
    lead: "판 한 장이 하루다. 오늘에서 뒤로 물러나 멈춰 선 그 하루가, 예측을 시작하는 기준 시점이 된다.",
    label: "과거로 되감기는 시간 터널",
  },

  moment: {
    title: "예측하는 날과 채점하는 날은 다릅니다",
    /** 안내 카드 본문의 앞부분. 뒤에 붙은 "왼쪽에서 …해 보라" 는 실험실 조작 지시라
     *  왼쪽 레일이 없는 랜딩에 그대로 옮기면 말이 안 된다. 앞 문장만 쓴다 */
    lead: "기준 시점은 예측을 하는 날이고, 확인 기간은 그 예측을 채점할 때까지의 거리다.",
    pin: "기준 시점",
    horizon: "확인 기간",
    scored: "채점",
    curtain: "그날 이후는 못 본다",
    revealed: "확인 기간이 지나면 실제가 드러난다",
    stats: [
      { value: "40", unit: "개", name: "고를 수 있는 기준 시점" },
      { value: String(HORIZON_CHOICES.length), unit: "가지", name: "확인 기간" },
      { value: "11", unit: "개", name: "업종" },
    ],
  },

  gather: {
    /** 재료 세 카드의 이름과 한 줄은 strings.lab.what.{cycle,news,impact} 를 그대로 쓴다.
     *  같은 문구를 두 벌 두지 않는다 */
    title: "그날까지 알 수 있던 것만 씁니다",
    lead: "이 도구는 미래를 보지 않는다. 기준 시점 전의 일정, 뉴스 판독, 비슷했던 날들만 모은다.",
    lateTitle: "기준일 뒤에 알려진 것",
    lateBody: "흐린 줄은 기준일에는 몰랐던 일이다. 화면에만 보이고 예측에는 안 들어갔다. 그걸 쓰면 과거로 돌려 본 성적이 통째로 거짓이 된다.",
    lateBadge: "안 썼다",
  },

  roll: {
    title: `${SIMULATIONS_LABEL}번 굴려 범위를 만듭니다`,
    lead: `모은 재료로 앞날을 ${SIMULATIONS_LABEL}번 그려 보고, 남은 길로 예상 중앙과 범위를 낸다.`,
    counterLabel: "굴린 횟수",
    honest: `화면에 보이는 선은 ${SIMULATIONS_LABEL}개 중 24개다. 나머지는 범위로만 남는다.`,
    keptLabel: "남은 길",
    droppedLabel: "체에 걸린 길",
    /** 고정 시드의 표본 24개는 전부 KEPT 다. 그림에서 떨어지는 줄 수는 실제 acceptRate 를
     *  24개에 맞춘 비율이고, 비율이라는 것을 이 문장이 밝힌다 */
    accept: (rate: string, dropped: number, shown: number) =>
      `이 업종은 굴린 길의 ${rate}가 체를 통과했다. 그림에서는 ${shown}개 중 ${dropped}개가 떨어진다 — 비율을 맞춘 것이다.`,
  },

  cascade: {
    title: "시장을 먼저 그리고, 그 답을 다음 층의 출발점으로 넘깁니다",
    lead: "앞 층의 답이 다음 층의 출발점이 된다. 시장이 흔들리면 업종이, 업종이 흔들리면 그 업종의 1등 종목이 같이 흔들린다.",
    layers: ["시장", "업종 11", "1등 종목 11"],
    foot: "히어로에서 본 세 장이 이것이다.",
  },

  band: {
    title: "남은 길이 범위가 됩니다",
    foot: "끝 날의 범위가 곧 업종 표의 80% 범위다.",
    legend: "80% 범위",
  },

  evidence: {
    title: "이건 그림이 아니라 진짜 계산입니다",
    setup: (asOf: string, horizon: string) => `${asOf} 기준 · ${horizon}`,
    foot: "이 숫자는 실험실에서 같은 설정으로 다시 나온다. 기준 시점을 옮기면 달라진다.",
  },

  honesty: {
    title: "틀린 것도 그대로 둡니다",
    body: "맞은 것만 보여 주는 도구는 배울 게 없다. 틀린 줄에는 무엇을 잘못 봤는지가 적혀 있다.",
    predicted: "예상했다",
    actual: "실제는",
    pushed: "이 재료가 가장 크게 밀었다",
  },

  preview: {
    title: "전체 화면",
    body: "왼쪽에서 조건을 바꾸고, 오른쪽에서 결과를 읽고, 모르는 말은 그 자리에서 물어본다.",
    imageAlt: "실험실 전체 화면 — 왼쪽 설정 레일과 오른쪽 결과 세 섹션",
    imageMobileAlt: "좁은 화면의 실험실 — 레일이 위로 접히고 하단 탭이 보인다",
    hotspots: [
      { name: "설정 레일", body: "기준 시점과 확인 기간, 켤 재료" },
      { name: "결과", body: "요약 문장, 경로 그림, 판정 표" },
      { name: "왜?", body: "이 숫자가 어떻게 나왔는지" },
    ],
  },

  repeat: {
    title: "저장하고 다시 엽니다",
    body: "저장한 실험은 다시 계산하지 않고 그 결과 그대로 열린다. 기준 시점을 옮겨 가며 쌓으면 어디서 자주 틀리는지가 보인다.",
  },

  limits: {
    title: "아닌 것",
    items: [
      "투자 권유가 아니다. 이 화면의 어떤 숫자도 사라는 말이 아니다.",
      "데이터는 무작위 데모다. 실제 시세도, 실제 기사도 아니다.",
      "매매 신호가 아니다. 이 도구가 하는 일은 예측이 어디서 틀리는지 보여 주는 것뿐이다.",
    ],
  },

  cta: {
    title: "첫 실험은 2026년 1월 15일에서 시작합니다",
    sub: "설정은 이미 채워져 있다. 계산하기만 누르면 첫 결과가 나온다.",
    start: "지금 시작하기",
    toLab: "지금 실험실로",
    /** 히어로의 그림과 이름이 같으면 getByRole("img", { name }) 이 둘을 잡는다 */
    stackLabel: "완성된 세 층",
  },

  footer: {
    note: "원본 목업과 같은 생성기를 쓴다. 같은 설정이면 같은 숫자가 나온다.",
  },
} as const;
