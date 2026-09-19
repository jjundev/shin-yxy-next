import { ApiError, getConfig, getSession, login, runLab } from "@/demo/adapter";
import { listSaved, saveExperiment } from "@/demo/saved";
import type { DemoUser, LabConfig, RunRequest, RunResult } from "@/demo/types";
import type { SavedExperiment } from "@/demo/saved";

/** 화면이 쓰는 다섯 가지. 전부 Promise 로 맞춰 나중에 실제 서버로 바꿔도 화면이 안 바뀐다 */
export const api = {
  config: (): Promise<LabConfig> => Promise.resolve(getConfig()),
  run: (req: RunRequest): Promise<RunResult> => runLab(req),
  save: (req: RunRequest, result: RunResult): Promise<SavedExperiment> =>
    Promise.resolve(saveExperiment(req, result)),
  saved: (): Promise<SavedExperiment[]> => Promise.resolve(listSaved()),
  session: (): Promise<DemoUser> => Promise.resolve(getSession()),
  login: (): Promise<{ accessToken: string; user: DemoUser }> => Promise.resolve(login()),
};

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
