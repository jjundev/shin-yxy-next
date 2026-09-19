export type BandMethod = "MONTE_CARLO" | "ANALYTIC";
export type SortKey = "CONVICTION" | "CENTER";
export type RoundKey = "0" | "1" | "2";

export interface ModuleSetting {
  on: boolean;
  filter: boolean;
}

export interface RoundSetting {
  quota: number;
  inherit: boolean;
  cutBelowStart: boolean;
  sort: SortKey;
  minConviction: number;
  modules: Record<string, ModuleSetting>;
}

export interface LabModule {
  key: string;
  name: string;
  axisKey: string;
  branch: "SHIFT" | "WIDTH";
  rounds: string;
  filterDir: "LOW" | "HIGH";
  canFilter: boolean;
  dataStart: string | null;
  implemented: boolean;
  description: string;
  group: string;
  params: unknown;
}

export interface LabConfig {
  axes: { key: string; name: string }[];
  modules: LabModule[];
  asofChoices: string[];
  defaultAsofIndex: number;
  defaults: Record<RoundKey, RoundSetting>;
  horizonDays: number;
  regressWindow: number;
  horizonChoices: number[];
  regressWindowChoices: number[];
  sortChoices: SortKey[];
  bandMethod: BandMethod;
  bandMethodChoices: BandMethod[];
  roundTripCost: number;
  flatBand: number;
  dataStart: string;
  dataEnd: string;
}

export interface RunRequest {
  asOf: string;
  horizonDays: number;
  regressWindow: number;
  bandMethod: BandMethod;
  rounds: Record<RoundKey, RoundSetting>;
}

export interface Contribution {
  moduleKey: string;
  moduleName: string;
  branch: "SHIFT" | "WIDTH" | "CUT";
  value: number;
  coefficient: number;
  rawValue: number;
  sampleSize: number;
}

/** 시장 하나 또는 업종 하나의 예상. round1.estimates 와 market 이 이 형태다. */
export interface Subject {
  subjectId: number;
  name: string;
  center: number;
  sigma: number;
  low50: number;
  high50: number;
  low80: number;
  high80: number;
  conviction: number;
  inheritedShift: number;
  beta: number;
  skew: number;
  acceptRate: number;
  histogram: number[];
  startClose: number;
  startAt: string;
  selected: boolean;
  excludedStage: string | null;
  excludedReason: string | null;
  unexplained: number;
  contributions: Contribution[];
  upProbability: number;
  flatProbability: number;
  actual: number | null;
}

/** 업종별 1등 종목 행. rows 가 이 형태다. */
export interface InstrumentRow {
  instrumentId: number;
  ticker: string;
  name: string;
  sectorId: number;
  sectorName: string;
  selected: boolean;
  center: number;
  sigma: number;
  low50: number;
  high50: number;
  low80: number;
  high80: number;
  conviction: number;
  weight: number;
  overlap: number;
  ret: number | null;
  spark: number[];
}

export interface RoundSummary {
  inCount: number;
  passCount: number;
  nominated: number;
  quota: number;
  cut: number;
  belowStart: number;
  filterKeys: string[];
  onKeys: string[];
  sampleDates: number;
  sampleSubjects: number;
  branches: Record<"SHIFT" | "WIDTH" | "CUT", unknown>;
  estimates: Subject[];
}

export interface SeriesPoint {
  date: string;
  v: number;
}

export interface RunResult {
  asOf: string;
  horizonDays: number;
  regressWindow: number;
  market: Subject;
  round1: RoundSummary;
  round2: RoundSummary;
  rows: InstrumentRow[];
  cashWeight: number;
  effectiveCount: number;
  bandMethod: BandMethod;
  costDrag: number;
  /** 거래비용을 뺀 뽑은 종목 평균 수익률. 확인 기간이 안 지났으면 null */
  avgReturn: number | null;
  benchReturn: number | null;
  portfolio: SeriesPoint[];
  benchmark: SeriesPoint[];
  horizonReached: boolean;
  paths: { dates: string[]; estimatedFrom: string; subjects: unknown };
}

export interface NewsJudgment {
  id: number;
  sectorId: number;
  sectorName: string;
  direction: string;
  strength: number;
  decayDays: number;
  rationale: string;
  judgedBy: string;
  judgedAt: string;
}

export interface NewsItem {
  id: number;
  publishedAt: string;
  collectedAt: string;
  source: string;
  title: string;
  url: string;
  scope: string;
  sectorId: number | null;
  sectorName: string | null;
  judgments: NewsJudgment[];
  used: boolean;
}

export interface NewsResponse {
  asOf: string;
  from: string;
  items: NewsItem[];
  judgeModel: string;
}

export interface LabEvent {
  id: number;
  subjectType: string;
  subjectId: number;
  subjectName: string;
  eventDate: string;
  eventType: string;
  knownAt: string;
  source: string;
  magnitude: number;
  direction: string;
  readBy: string;
  note: string;
  used: boolean;
}

export interface EventsResponse {
  asOf: string;
  until: string;
  horizonDays: number;
  known: LabEvent[];
  unknown: LabEvent[];
}

export interface DemoUser {
  id: number;
  loginId: string;
  name: string;
  roles: string[];
}

export interface Sector {
  id: number;
  name: string;
}
