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

## 원본에서 다시 추출

    pnpm extract    # src/demo/generated/adapter.js, src/content/extracted.json

## 설계 문서

- 스펙: `../docs/superpowers/specs/2026-09-19-shin-yxy-next-design.md`
- 계획: `../docs/superpowers/plans/`
