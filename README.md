# 주식 길잡이 실험실 (재구현)

`../shin-yxy-mock/`의 빌드 산출물을 스펙 삼아 새로 만든 프런트엔드입니다.
데이터는 원본 번들에서 추출한 데모 생성기를 그대로 씁니다. 실제 서버에 연결하지 않습니다.

## 실행

    pnpm install
    pnpm dev

## 검증

    pnpm verify     # 타입 검사, 단위 테스트, 빌드
    pnpm e2e        # Playwright 스모크 (데스크톱, 모바일)

## 실험실 (2단계)

- 왼쪽 레일: 기준 시점(평일 슬라이더), 확인 기간(1·5·10·20거래일), 계산하기, 저장, 재료 세 섹션.
- 오른쪽: 계산(요약 문장), 무엇을 뽑았나(경로 차트 + 순위), 맞았나(판정 표). 섹션마다 "왜?" 패널.
- 원본과 대조: `.claude/launch.json` 의 `mock`(4180)과 `next`(4190)를 같이 띄우고 기준 시점 2026-01-15 로 요약 문장과 표를 비교한다.
- 설계: `../docs/superpowers/specs/2026-09-20-shin-yxy-next-lab-design.md`

## 첫 실행 안내와 저장소 (3단계)

- 첫 방문(`shin.onboarded` 없음)에는 실험실이 안내 모드로 열린다. 레일 위 체크리스트 네 단계, 오른쪽 안내 카드 하나. 완료 조건은 실제 조작(기준 시점·확인 기간 바꿈 → 재료 펼침 → 계산하기 → 판정 표까지 스크롤). "건너뛰기"와 상단 메뉴 "첫 실험 다시 보기".
- 저장소 카드: 기준 시점, 확인 기간, 저장한 날, 요약 문장, 켠 재료 수, 뽑은 업종, 판정. "실험실에서 열기"는 다시 계산하지 않고 그 결과로 실험실을 연다(레일에 "저장한 실험을 보는 중", "새로 계산").
- 설계: `../docs/superpowers/specs/2026-09-20-shin-yxy-next-guide-saved-design.md`

## 원본에서 다시 추출

    pnpm extract    # src/demo/generated/adapter.js, src/content/extracted.json

## 설계 문서

- 스펙: `../docs/superpowers/specs/2026-09-19-shin-yxy-next-design.md`
- 계획: `../docs/superpowers/plans/`
