# 랜딩 그림 자료 명세

대상: `shin-yxy-next` 랜딩(`/`). 설계는 `../docs/superpowers/specs/2026-09-20-shin-yxy-next-landing-design.md`.

## 공통 규칙

- 팔레트는 `src/design/tokens.css` 의 토큰만 쓴다.
  라이트 배경 `#ffffff`, 글 `#14171c`, 강조 `#2563eb`, 테두리 `#e3e6eb`.
  다크 배경 `#0b1117`, 글 `#edf2f4`, 강조 `#6ba1fa`, 테두리 `#263241`.
  상승색 `#c8352a`(다크 `#f08a80`), 하락색 `#2a4fb8`(다크 `#8fbefc`).
- 실존 브랜드, 로고, 실제 종목명, 실제 티커, 사람 얼굴을 넣지 않는다.
- 그림 안에 글자를 넣지 않는다(가상 앱 화면의 더미 한글은 예외).
- 포맷 `.webp`, 스크린샷은 `.png`. 파일은 `src/assets/landing/` 에 둔다.
- 넣은 뒤 `src/assets/landing/manifest.ts` 의 `landingAssets` 에 한 줄을 더한다. 그것만 하면 자리에 들어간다.

## A. 생성이 필요한 것 (별도 세션)

### `hero-aurora`
- 자리: S1 히어로 배경. 글과 3D 스택 뒤에 깔린다.
- 크기: 2560×1440 (16/9). **라이트·다크 2종**.
- 내용: 화면 아래쪽에서 올라오는 넓고 부드러운 푸른 광원 하나, 그 위에 아주 옅은 정방 격자.
  중앙 상단 40% 는 글이 앉을 자리라 거의 비워 둔다.
- 금지: 또렷한 형체, 별·입자 남발, 보라·분홍 계열.
- 파일: `hero-aurora-light.webp`, `hero-aurora-dark.webp`

### `contrast-forecast-app`
- 자리: S2 대조 섹션 왼쪽 카드.
- 크기: 1200×900 (4/3). 1종(라이트만. 다크에서는 투명도로 눌린다).
- 내용: **가상의** 주식 예측 앱 화면 일러스트. 목록 다섯 줄, 각 줄에 이름 자리와 "오를 확률 %" 같은 막대.
  위에 큰 숫자 하나. 전체적으로 자신만만하고 화려한 분위기 — 채점란이 없다는 게 핵심이다.
- 더미 텍스트: "종목 가", "종목 나" 같은 무의미한 한글. 실제 종목명 금지.
- 금지: 실존 서비스를 알아볼 수 있는 어떤 요소도.
- 파일: `contrast-forecast-app.webp`

### `og-card`
- 자리: `index.html` 의 `og:image` (AssetSlot 이 아니다. manifest 에 넣지 않는다).
- 크기: 1200×630. 1종.
- 내용: 약속 문장 한 줄 + 경로 팬 실루엣. 다크 배경.
- 파일: `public/og-card.png`

### `texture-grid` (선택)
- 자리: 전역 미세 격자.
- 크기: 256×256 타일, 이음매 없음.
- CSS `repeating-linear-gradient` 로 같은 결과가 나오면 **만들지 않는다**. 먼저 CSS 를 시도한다.

## B. 생성하지 말고 캡처할 것 (Playwright)

UI 스크린샷을 그림으로 만들면 화면이 바뀌는 순간 거짓말이 된다. 고정 시드로 찍으면 결정적이고,
상위 스펙 §9.3 시각 회귀와 같은 장비를 쓴다.

| id | 무엇 | 뷰포트 | 조건 |
|---|---|---|---|
| `lab-full` | 실험실 전체 | 1440×900 | 2026-01-15 · 20거래일 계산 완료. 라이트·다크 2장 |
| `lab-mobile` | 좁은 화면 실험실 | 390×844 | 같은 설정. 레일이 접히고 하단 탭이 보이는 상태. 1장 |

파일명: `lab-full-light.png`, `lab-full-dark.png`, `lab-mobile.png`

저장소는 그림을 쓰지 않는다 — S11 이 `api.saved()` 의 시드 3건을 실제 카드로 그린다.

## C. 등록 예시

```ts
// src/assets/landing/manifest.ts
import heroLight from "./hero-aurora-light.webp";
import heroDark from "./hero-aurora-dark.webp";
import labLight from "./lab-full-light.png";
import labDark from "./lab-full-dark.png";

export const landingAssets: Partial<Record<AssetId, AssetEntry>> = {
  "hero-aurora": { light: heroLight, dark: heroDark },
  "lab-full": { light: labLight, dark: labDark },
};
```
