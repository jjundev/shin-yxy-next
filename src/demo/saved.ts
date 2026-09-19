import { defaultRequest } from "./adapter";
import * as gen from "./generated/adapter";
import type { RunRequest, RunResult } from "./types";

export interface SavedExperiment {
  id: string;
  savedAt: string;
  request: RunRequest;
  result: RunResult;
}

/** 스펙 7.4: 성공(셋 다 맞음), 실패, 성공(하나만 맞음) 순 */
export const SEED_ASOFS = ["2025-10-15", "2025-04-15", "2024-01-15"] as const;

let store: SavedExperiment[] = [];
let counter = 0;

function make(request: RunRequest, result: RunResult, savedAt: string): SavedExperiment {
  counter += 1;
  return { id: `exp-${counter}`, savedAt, request, result };
}

function seed(): void {
  counter = 0;
  store = SEED_ASOFS.map((asOf, i) => {
    const request = { ...defaultRequest(), asOf };
    // 저장 시각은 최근 것이 먼저 오도록 시드 순서를 역순으로 준다
    const savedAt = `2026-09-1${3 - i}T09:00:00.000Z`;
    return make(request, gen.runLab(request), savedAt);
  });
}

export function listSaved(): SavedExperiment[] {
  return [...store].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveExperiment(
  request: RunRequest,
  result: RunResult,
  now: Date = new Date(),
): SavedExperiment {
  const entry = make(request, result, now.toISOString());
  store.push(entry);
  return entry;
}

export function getSaved(id: string): SavedExperiment | undefined {
  return store.find((s) => s.id === id);
}

export function resetSaved(): void {
  seed();
}

seed();
