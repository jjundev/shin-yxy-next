import {
  ApiError, defaultRequest, getConfig, getEvents, getNews, getSession, login, runLab,
} from "@/demo/adapter";
import { listSaved, saveExperiment, subscribeSaved } from "@/demo/saved";
import type {
  DemoUser, EventsResponse, LabConfig, NewsResponse, RunRequest, RunResult,
} from "@/demo/types";
import type { SavedExperiment } from "@/demo/saved";
import { NEWS_DAYS } from "@/content/constants";

/** 화면이 쓰는 것 전부. 비동기는 Promise 로 맞춰 나중에 실제 서버로 바꿔도 화면이 안 바뀐다.
 *  생성기가 던지면 거부로 바꾸도록 async 화살표를 쓴다 */
export const api = {
  config: async (): Promise<LabConfig> => getConfig(),
  defaultRequest: (config?: LabConfig): RunRequest => defaultRequest(config),
  run: (req: RunRequest): Promise<RunResult> => runLab(req),
  news: async (asOf: string, days = NEWS_DAYS): Promise<NewsResponse> => getNews(asOf, days),
  events: async (asOf: string, horizonDays: number): Promise<EventsResponse> =>
    getEvents(asOf, horizonDays),
  save: async (req: RunRequest, result: RunResult): Promise<SavedExperiment> =>
    saveExperiment(req, result),
  saved: async (): Promise<SavedExperiment[]> => listSaved(),
  onSavedChange: (listener: () => void): (() => void) => subscribeSaved(listener),
  session: async (): Promise<DemoUser> => getSession(),
  login: async (): Promise<{ accessToken: string; user: DemoUser }> => login(),
};

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
