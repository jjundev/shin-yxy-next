# 주식 길잡이 실험실 (재구현)

`../shin-yxy-mock/`의 빌드 산출물을 스펙 삼아 새로 만든 프런트엔드입니다.
데이터는 원본 번들에서 추출한 데모 생성기를 그대로 씁니다. 실제 서버에 연결하지 않습니다.

## 실행

    pnpm install
    pnpm dev

## 검증

    pnpm verify     # 타입 검사, 단위 테스트, 빌드
    pnpm e2e        # Playwright 스모크 (데스크톱, 모바일)

## 원본에서 다시 추출

    pnpm extract    # src/demo/generated/adapter.js, src/content/extracted.json

## 설계 문서

- 스펙: `../docs/superpowers/specs/2026-09-19-shin-yxy-next-design.md`
- 계획: `../docs/superpowers/plans/`
