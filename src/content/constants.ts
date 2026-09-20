/** 원본 몬테카를로 횟수. "왜?" 패널, 차트 머리글, 용어 풀이가 같이 쓴다 */
export const SIMULATIONS = 4000;
export const SIMULATIONS_LABEL = SIMULATIONS.toLocaleString("en-US");
/** 원본 기본 newsDays (2단계 설계 결정 5) */
export const NEWS_DAYS = 7;

/** 원본 화면의 확인 기간 네 칩. config.horizonChoices(1~22) 가 아니다.
 *  실험실 "언제" 섹션과 랜딩 S3 이 같이 쓴다 */
export const HORIZON_CHOICES = [1, 5, 10, 20];

/** 상위 스펙 5.4 고정 시드. 안내 모드와 랜딩 증거가 같은 입력으로 같은 결과를 낸다.
 *  오늘의 config.defaultAsofIndex 와 같은 값이지만, 설정이 바뀌어도 랜딩의 증거가
 *  움직이지 않도록 값을 직접 박는다 */
export const FIXED_AS_OF = "2026-01-15";
export const FIXED_HORIZON_DAYS = 20;
