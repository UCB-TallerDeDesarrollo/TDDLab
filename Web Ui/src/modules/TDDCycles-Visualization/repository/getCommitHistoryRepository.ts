import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { CommitHistoryAdapter } from "./CommitHistoryAdapter";
import { FakeCommitHistoryRepository } from "./FakeCommitHistoryRepository";
import { isDevelopment, VITE_USE_FAKE_REPOSITORY } from "../../../../config";

export function getCommitHistoryRepository(isQueryFake = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fake") === "true"): CommitHistoryRepository {
  const isEnvFake = VITE_USE_FAKE_REPOSITORY === "true";

  if (isDevelopment && (isEnvFake || isQueryFake)) {
    return new FakeCommitHistoryRepository();
  }
  return new CommitHistoryAdapter();
}
