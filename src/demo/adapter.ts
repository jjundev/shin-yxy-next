import * as gen from "./generated/adapter";
import type {
  DemoUser,
  EventsResponse,
  LabConfig,
  NewsResponse,
  RunRequest,
  RunResult,
} from "./types";

export interface RunOptions {
  /** 밀리초. 생략하면 setRunDelay 로 정한 지연을 쓴다 */
  delayMs?: number;
}

let runDelay: () => number = () => 350 + Math.random() * 350;

/** 실행 지연을 바꾼다. 원본은 350~700ms 무작위다 */
export function setRunDelay(fn: () => number): void {
  runDelay = fn;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getConfig(): LabConfig {
  return gen.config;
}

export function defaultRequest(config: LabConfig = gen.config): RunRequest {
  return {
    asOf: config.asofChoices[config.defaultAsofIndex],
    horizonDays: config.horizonDays,
    regressWindow: config.regressWindow,
    bandMethod: config.bandMethod,
    rounds: structuredClone(config.defaults),
  };
}

export async function runLab(req: RunRequest, opts: RunOptions = {}): Promise<RunResult> {
  const ms = opts.delayMs ?? runDelay();
  if (ms > 0) await sleep(ms);
  return gen.runLab(req);
}

export function getNews(asOf: string, days = 7): NewsResponse {
  return gen.news(asOf, Math.min(30, days));
}

export function getEvents(asOf: string, horizonDays = 20): EventsResponse {
  return gen.events(asOf, horizonDays);
}

export function login(): { accessToken: string; user: DemoUser } {
  return { accessToken: "demo", user: gen.demoUser };
}

export function getSession(): DemoUser {
  return gen.demoUser;
}

export { ApiError } from "./generated/adapter";
