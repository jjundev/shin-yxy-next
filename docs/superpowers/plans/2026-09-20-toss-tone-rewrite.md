# 토스(Toss) 스타일 UX 라이팅 전면 전환 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 웹사이트 전체(랜딩, 온보딩 가이드, 실험실 레일/인스펙터, Why 해설, 저장소)의 거친 개발자조/한다체/명령형/AI 슬롭 문구를 토스식 5대 코어 밸류(Clear, Concise, Casual, Respect, Emotional) 기반의 친근하고 다정한 '해요체' 및 능동형 문장으로 전면 개편하고, 52개 테스트 스위트 및 e2e 검증을 완벽하게 통과시킵니다.

**Architecture:** 카피 중앙 집중화 파일(`landing.ts`, `strings.ts`, `why.ts`, `labels.ts`)과 인라인 컴포넌트(`inspector.tsx`)의 역할을 분리하고, 파일 간 쓰기 충돌이 없도록 3개의 독립 작업 도메인(랜딩, 실험실/가이드/저장소, Why/인스펙터)으로 분할하여 병렬 서브에이전트로 동시 실행한 뒤 통합 E2E 검증을 진행합니다.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Vitest, Testing Library, Playwright.

**Spec:** [웹사이트 전면 문구 정비 및 토스(Toss) 스타일 UX 라이팅 전환 설계](conversation://2b359206-412a-4de2-b9ba-1ac9d0c41fb7)

## Global Constraints

- 모든 문장형 텍스트는 비격식 존댓말인 **'해요체'**(`~해요`, `~해 보세요`, `~예요`)로 100% 통일한다 (제목 '합니다체' + 본문 '한다체' 이원화 폐지).
- 핵심 액션 CTA 및 네비게이션 라벨(`계산하기`, `저장`, `실험실`, `저장소`, `실험실에서 열기`, `건너뛰기`, `다시 시도`, `첫 실험 시작하기`)은 직관성과 접근성 유지를 위해 변경하지 않는다 (추천안 A 채택).
- 랜딩 페이지의 한계 섹션 제목은 **"꼭 확인해 주세요"**로 변경한다 (`landing.ts:123`, 추천안 A 채택).
- AI 슬롭 및 날것의 개발 메모 표현(`"자리만 — 아직 계산이 없다"`, `"통째로 거짓이 된다"`, `"안 썼다"`, `"배울 게 없다"`)을 완전 제거하고 친절한 사용자 중심 맥락으로 재작성한다.
- 52개 테스트 파일(288개 테스트) 및 Playwright e2e 테스트의 문자열 expectation을 변경된 문구와 완전 일치시켜 지속적 그린(Green)을 유지한다.

---

## 병렬 실행 구조 (Parallel Dispatch Plan)

```
[Parent Agent Coordinator]
       │
       ├───▶ [Agent 1: Landing Domain]
       │      - src/content/landing.ts
       │      - src/content/landing.test.ts
       │      - src/screens/landing/landing.test.tsx
       │
       ├───▶ [Agent 2: Lab & Guide Domain]
       │      - src/content/strings.ts
       │      - src/content/labels.ts
       │      - src/screens/saved.test.tsx
       │      - src/screens/lab/guide.test.ts
       │
       └───▶ [Agent 3: Why & Inspector Domain]
              - src/content/why.ts
              - src/content/why.test.ts
              - src/screens/lab/inspector.tsx
              - src/screens/lab/lab.test.tsx
       │
       ▼ (모든 서브에이전트 작업 완료 후)
[Integration & E2E Validation Phase]
       - e2e/onboarding.spec.ts, e2e/saved.spec.ts, e2e/shell.spec.ts
       - pnpm verify && pnpm e2e
```

---

### Task 1: [Landing Domain] 랜딩 페이지 카피 토스화 및 테스트 갱신 (Parallel Agent 1)

**Files:**
- Modify: `src/content/landing.ts`
- Modify: `src/content/landing.test.ts`
- Modify: `src/screens/landing/landing.test.tsx`

**Interfaces:**
- Consumes: `landing` object definition, `strings.landing`
- Produces: Toss-style landing copy with full test pass

- [ ] **Step 1: `src/content/landing.ts` 문구 개편**
  - `contrast.title`: `"내일 무엇이 오를지 알려주는 화면은 이미 많아요"`
  - `contrast.body`: `"하지만 그 화면들은 예측이 맞았는지는 알려주지 않아요. 이 도구는 과거의 하루로 돌아가, 그날 알 수 있던 정보만 넣고 지나간 실제 결과와 투명하게 맞춰봐요."`
  - `contrast.theirsFoot`: `"무엇이 오를지만 말하고, 맞았는지는 알려주지 않아요."`
  - `contrast.oursFoot`: `"무엇이 오를지 예측하고, 실제 결과와 곧바로 채점해요."`
  - `tunnel.title`: `"그래서 과거의 하루로 돌아가요"`
  - `tunnel.lead`: `"오늘에서 과거로 돌아가 멈춘 그 하루가, 예측을 시작하는 기준 시점이 돼요."`
  - `moment.title`: `"예측하는 날과 채점하는 날은 달라요"`
  - `moment.lead`: `"기준 시점은 예측을 시작하는 날이고, 확인 기간은 실제 결과를 확인할 때까지의 기간이에요."`
  - `moment.curtain`: `"기준일 이후 정보는 가려둬요"`
  - `moment.revealed`: `"확인 기간이 지나면 실제 결과가 나타나요"`
  - `gather.title`: `"그날까지 알 수 있던 정보만 써요"`
  - `gather.lead`: `"미래 정보는 미리 보지 않아요. 기준 시점 전에 알려진 일정과 뉴스, 유사 국면 데이터만 모아요."`
  - `gather.lateTitle`: `"기준일 이후에 알려진 정보"`
  - `gather.lateBody`: `"흐리게 표시된 항목은 기준일 이후에 나온 정보예요. 미리 알 수 없던 정보를 넣으면 예측이 왜곡되기 때문에, 화면에서 참고만 할 수 있고 계산에는 넣지 않았어요."`
  - `gather.lateBadge`: `"계산 제외"`
  - `roll.title`: `${SIMULATIONS_LABEL}번 시뮬레이션해 범위를 계산해요`
  - `roll.lead`: `모은 재료로 앞날을 ${SIMULATIONS_LABEL}번 시뮬레이션해 보고, 신뢰할 수 있는 경로로 예상 범위와 중앙값을 계산해요.`
  - `roll.honest`: `화면에는 ${SIMULATIONS_LABEL}개 경로 중 대표 24개만 보여드려요. 나머지는 전체 범위로 표시돼요.`
  - `cascade.title`: `"시장 흐름을 먼저 예측하고, 다음 층으로 넘겨요"`
  - `cascade.lead`: `"시장 전체가 흔들리면 업종이 영향을 받고, 업종이 움직이면 1등 종목도 함께 움직여요. 위층의 분석 결과를 다음 층의 출발점으로 전달해요."`
  - `cascade.foot`: `"화면 상단에서 보았던 3단계 구조예요."`
  - `band.title`: `"남은 경로가 예상 범위가 돼요"`
  - `band.foot`: `"마지막 날의 범위가 업종 표에 표시되는 80% 신뢰 구간이에요."`
  - `evidence.title`: `"단순한 그림이 아니라 실제 계산 결과예요"`
  - `evidence.foot`: `"실험실에서 같은 조건으로 실행하면 동일한 결과가 나와요. 기준 시점을 바꾸면 예측값도 달라져요."`
  - `honesty.title`: `"틀린 예측도 숨김없이 그대로 보여줘요"`
  - `honesty.body`: `"성공한 예측만 보여주지 않아요. 예측이 빗나갔을 때도 어떤 변수가 영향을 주었는지 명확하게 알려드려요."`
  - `honesty.pushed`: `"이 재료가 가장 크게 밀었어요"`
  - `preview.body`: `"왼쪽에서 조건을 바꾸고 오른쪽에서 결과를 확인해요. 어려운 용어는 그 자리에서 바로 뜻을 볼 수 있어요."`
  - `repeat.title`: `"저장하고 언제든 다시 열어봐요"`
  - `repeat.body`: `"저장한 실험은 다시 계산할 필요 없이 바로 열려요. 여러 기준일의 실험을 차곡차곡 쌓다 보면 어떤 상황에서 예측이 빗나가는지 한눈에 파악할 수 있어요."`
  - `limits.title`: `"꼭 확인해 주세요"`
  - `limits.items`:
    - `"투자 권유가 아니에요. 화면에 표시되는 수치는 매수를 추천하는 것이 아니에요."`
    - `"실제 시세나 실제 기사가 아닌 무작위 가상 데모 데이터예요."`
    - `"매매 신호가 아니에요. 알고리즘 예측의 원리와 오차를 학습하는 도구예요."`
  - `cta.sub`: `"기본 조건이 이미 설정되어 있어요. ‘계산하기’만 누르면 첫 결과를 볼 수 있어요."`
  - `footer.note`: `"원본 목업과 같은 생성기를 써요. 같은 설정이면 같은 숫자가 나와요."`

- [ ] **Step 2: 랜딩 테스트 기대값 검증 및 실행**
  - Run: `pnpm vitest run src/content/landing.test.ts src/screens/landing/`
  - 만약 테스트에서 기존 어조(예: `limits.title === "아닌 것"`, `lateBadge === "안 썼다"`)를 검증하고 있다면 `landing.test.ts` 및 `landing.test.tsx`의 expectation을 함께 동기화.

---

### Task 2: [Lab & Guide Domain] 온보딩 가이드, 저장소, strings 카피 토스화 및 테스트 갱신 (Parallel Agent 2)

**Files:**
- Modify: `src/content/strings.ts`
- Modify: `src/content/labels.ts`
- Modify: `src/screens/saved.test.tsx`
- Modify: `src/screens/lab/guide.test.ts`

**Interfaces:**
- Consumes: `strings`, `labels`
- Produces: Toss-style guide, strings, and labels with full test pass

- [ ] **Step 1: `src/content/strings.ts` 문구 개편**
  - `demoBadgeHint`: `"저장한 실험은 새로고침하면 기본 예시로 돌아가요."`
  - `promise`: `"과거의 하루로 돌아가 그날의 정보만으로 예측하고, 실제 결과와 맞춰봐요."`
  - `sub`: `"미래를 맞히는 도구가 아니에요. 예측이 어디서 맞고 틀리는지 과정을 확인하는 실험실이에요."`
  - `toast.unknownRoute`: `"찾으시는 화면이 없어 실험실로 이동했어요."`
  - `lab.emptyResult`: `"‘계산하기’를 누르면 결과가 나와요."`
  - `lab.saveFailed`: `"저장하지 못했어요"`
  - `lab.when.dirty`: `"바꾼 설정을 먼저 계산해 주세요"`
  - `lab.when.viewingSaved`: `(asOf: string) => "저장한 실험을 보고 있어요 · ${asOf}"`
  - `lab.what.unavailableFrom`: `(start: string | null) => "데이터가 ${start ?? '없음'}부터 있어서 이 기준일에는 쓸 수 없어요"`
  - `lab.what.notImplemented`: `"준비 중인 기능이에요"`
  - `lab.what.cycle.off`: `"끔 · 일정 제외"`
  - `lab.what.cycle.error`: `"일정을 불러오지 못했어요."`
  - `lab.what.cycle.eventsEmpty`: `"이 기간에 등록된 일정이 없어요."`
  - `lab.what.cycle.lateNote`: `" 기준일 이후 등록 · 예측 제외"`
  - `lab.what.cycle.lateFoot`: `(n: number) => "흐리게 표시된 ${n}건은 기준일 이후에 나온 일정이에요. 예측 계산에는 들어가지 않았어요."`
  - `lab.what.news.error`: `"뉴스를 불러오지 못했어요."`
  - `lab.what.news.empty`: `"이 기간에 수집된 기사가 없어요."`
  - `lab.what.news.lateFoot`: `"흐리게 표시된 기사는 기준일 이후에 판독되었어요. 화면에서 참고만 할 수 있고 예측에는 들어가지 않았어요."`
  - `lab.what.impact.none`: `"이 환경에는 유사 국면 데이터가 없어요."`
  - `lab.what.impact.off`: `"끔 · 계산 제외"`
  - `lab.summary.notYet`: `(horizon: string) => "아직 ${horizon}이 지나지 않아 실제 결과가 나오지 않았어요."`
  - `lab.summary.partial`: `"확인 기간이 진행 중이에요. 지금까지는 "`
  - `lab.summary.earnedMore`: `"더 벌었어요"`
  - `lab.summary.earnedLess`: `"덜 벌었어요"`
  - `lab.guide.steps`:
    - Step 1: `head: "예측하는 날과 채점하는 날이 달라요"`, `body: "기준 시점은 예측을 시작하는 날이고, 확인 기간은 실제 결과를 확인할 때까지의 기간이에요. 왼쪽에서 기준 시점을 옮기거나 확인 기간을 바꿔 보세요."`
    - Step 2: `head: "그날까지 알 수 있던 정보만 써요"`, `body: "미래 데이터는 미리 보지 않아요. 기준 시점 전에 알려진 일정과 뉴스, 유사 국면 데이터만 모아요. 왼쪽에서 재료를 펼쳐 어떤 정보가 들어가는지 확인해 보세요."`
    - Step 3: `head: "${SIMULATIONS_LABEL}번 시뮬레이션해 범위를 계산해요"`, `body: "모은 재료로 앞날을 ${SIMULATIONS_LABEL}번 시뮬레이션해 보고, 유효한 경로를 추려 예상 범위와 중앙값을 계산해요. 날짜나 재료를 바꾸면 자동으로 다시 계산돼요."`
    - Step 4: `head: "예상과 실제, 판정 결과를 확인해요"`, `body: "선정한 업종과 예상 수익률, 경로 차트, 실제 결과와의 비교 판정을 한눈에 볼 수 있어요. 아래 판정 표까지 스크롤해 보세요."`
  - `saved.empty`: `"실험실에서 저장을 누르면 여기에 모여요."`
  - `saved.loadFailed`: `"저장한 실험을 불러오지 못했어요."`

- [ ] **Step 2: `src/content/labels.ts`의 `TERM_GLOSSARY` 문구 다듬기**
  - "굴린 길": `업종 하나의 앞날을 ${SIMULATIONS_LABEL}번 시뮬레이션해 본 가상 경로예요. 남은 경로들로 신뢰 범위를 계산해요.`
  - "뽑음": `알고리즘이 선정한 업종이에요. 예상 수익률과 확신도가 높은 순으로 정원만큼 골라요.`
  - "안 뽑음": `순위에는 올랐지만 최종 정원에 들지 못한 업종이에요.`
  - "판독": `기준 시점 전 며칠 동안의 뉴스를 분석해 업종별 영향 방향과 강도로 변환한 정보예요.`
  - "재료": `예측 계산에 들어가는 입력 데이터예요. 일정, 뉴스 분석, 유사 국면이 포함돼요.`
  - "돈의 흐름": `수급과 변동성처럼 가격 자체가 아닌 자금의 흐름을 반영하는 재료예요.`

- [ ] **Step 3: 테스트 기대값 동기화 및 검증**
  - Run: `pnpm vitest run src/screens/saved.test.tsx src/screens/lab/guide.test.ts src/content/content.test.ts`
  - `saved.test.tsx`의 `"저장소를 불러오지 못했다."` → `"저장한 실험을 불러오지 못했어요."` 갱신.

---

### Task 3: [Why & Inspector Domain] Why 시트 및 인스펙터 카피 토스화 및 테스트 갱신 (Parallel Agent 3)

**Files:**
- Modify: `src/content/why.ts`
- Modify: `src/content/why.test.ts`
- Modify: `src/screens/lab/inspector.tsx`
- Modify: `src/screens/lab/lab.test.tsx`

**Interfaces:**
- Consumes: `whyCalc`, `WHY_PICKS`, `WHY_VERDICT`, inspector UI
- Produces: Toss-style explanation copy with full test pass

- [x] **Step 1: `src/content/why.ts` 문구 개편**
  - `REMAIN_BODY`: `"남은 경로들로 날짜별 예상 중앙값과 80% 신뢰 구간을 계산해요. 10번 중 8번은 이 안에서 움직일 것으로 기대하는 범위예요."`
  - `whyCalc.steps`:
    - Step 1: `head: "재료 모으기"`, `body: "기준일 당시에 이미 알려져 있던 일정, 계절성, 핵심 뉴스 방향만 모아요. 나중에 알려진 정보는 예측의 객관성을 위해 전혀 사용하지 않아요."`, `foot: (n) => "켠 재료 ${n}개"`
    - Step 2: `head: "시뮬레이션"`, `body: "앞으로의 가격 경로를 하루 단위로 ${SIMULATIONS_LABEL}번 그려봐요. 시장 전체를 먼저 시뮬레이션하고, 그 결과를 업종과 1등 종목으로 차례대로 넘겨요. 뉴스의 영향은 초기 며칠에 집중돼요."`
    - Step 3: `head: "범위 도출"`, `body: REMAIN_BODY`, `foot: "결과가 나오면 표시돼요"`
  - `whyCalc.closing`: `"도출된 범위는 ‘반드시 이렇게 된다’는 확정이 아니라, ‘현재 알 수 있는 정보로는 이 범위까지 좁힐 수 있다’는 뜻이에요. 기준 시점을 과거로 옮기면 그때의 정보만으로 다시 계산해 실제 결과와 맞춰볼 수 있어요."`
  - `WHY_PICKS.legendActual`: `"얇은 선은 대상 하나의 실제 움직임, 굵은 선은 선택한 대상, 음영 영역은 80% 예상 범위예요."`
  - `WHY_PICKS.legendRolled`: `(n) => "옅은 선은 기준일에 시뮬레이션한 ${n}개 경로(회색 점선은 필터링된 경로), 음영 영역은 80% 예상 범위예요."`
  - `WHY_PICKS.band`: `"예상 중앙값과 범위는 날짜별로 계산된 결과예요. 뉴스 영향은 초기에 집중되고(반감 5거래일) 이후에는 점차 넓어져요. 마지막 날의 범위가 업종 표의 80% 범위와 같아요."`
  - `WHY_VERDICT.title`: `"확신도와 판정, 어떻게 계산되었을까요?"`
  - `WHY_VERDICT.rule`: `"판정은 업종 층에서 진행돼요. 방향이 맞고 80% 범위 안이면 성공, 방향만 맞으면 방향만 맞음, 방향이 어긋나면 실패예요. 실험 전체는 확인 기간이 지나고 평균 수익률이 시장 대비 0 이상이면 예상 성공, 낮으면 예상 실패로 판정돼요."`

- [x] **Step 2: `src/screens/lab/inspector.tsx` 인라인 문구 개편**
  - Line 132: `"계산하기를 실행하면 선택된 대상의 상세 기여도와 분석 지표가 여기에 표시됩니다."` → `"‘계산하기’를 누르면 선택한 대상의 상세 기여도와 분석 지표를 볼 수 있어요."`
  - Line 212: `"영향을 준 주요 재료가 없습니다."` → `"영향을 준 주요 재료가 없어요."`
  - Line 221: `"선택된 다른 업종 바로보기"` → `"선택된 다른 업종 보기"`

- [x] **Step 3: 테스트 기대값 동기화 및 검증**
  - Run: `pnpm vitest run src/content/why.test.ts src/screens/lab/lab.test.tsx`
  - `why.test.ts`의 expectation과 `lab.test.tsx` expectation 동기화.

---

### Task 4: [Integration] E2E 테스트 스펙 동기화 및 종합 검증 (Parent Agent)

**Files:**
- Modify: `e2e/onboarding.spec.ts`
- Modify: `e2e/saved.spec.ts`
- Modify: `e2e/shell.spec.ts`

- [ ] **Step 1: E2E 테스트 문자열 동기화**
  - `e2e/onboarding.spec.ts` & `e2e/shell.spec.ts`:
    - `"계산하기를 누르면 결과가 여기에 나옵니다."` → `"‘계산하기’를 누르면 결과가 나와요."`
    - `"그 화면은 이 목업에 없어 실험실로 왔습니다."` → `"찾으시는 화면이 없어 실험실로 이동했어요."`
  - `e2e/saved.spec.ts`:
    - `"저장한 실험을 보는 중 · 2026-01-15"` → `"저장한 실험을 보고 있어요 · 2026-01-15"`
- [ ] **Step 2: 단위 테스트 전체 검증**
  - Run: `pnpm verify` (타입 검사 + 52개 테스트 스위트 전원 Green)
- [ ] **Step 3: E2E 테스트 실행**
  - Run: `pnpm e2e`
- [ ] **Step 4: 변경 사항 최종 확인 및 정리**
