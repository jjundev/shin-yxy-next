import type {
  DemoUser,
  EventsResponse,
  LabConfig,
  NewsResponse,
  RunRequest,
  RunResult,
  Sector,
} from "../types";

export class ApiError extends Error {
  status: number;
  detail?: string;
  errors?: unknown;
  problem?: unknown;
  constructor(status: number, message: string, body?: unknown);
  get isNetworkError(): boolean;
}

export const config: LabConfig;
export function runLab(req: RunRequest): RunResult;
export function news(asOf: string, days: number): NewsResponse;
export function events(asOf: string, horizonDays: number): EventsResponse;
export const demoUser: DemoUser;
export const sectors: Sector[];
export const tickers: string[][];
export class Rng {
  constructor(seed: string);
  next(): number;
  norm(): number;
  pick<T>(list: T[]): T;
}
export function hashSeed(s: string): number;
export function rawRequest(method: string, path: string, body?: unknown): Promise<unknown>;
