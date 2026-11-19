import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { CommitHistoryAdapter } from "./CommitHistoryAdapter";
import { FakeCommitHistoryRepository } from "./FakeCommitHistoryRepository";
import { VITE_USE_FAKE_REPOSITORY } from "../../../../config";

export function getCommitHistoryRepository(): CommitHistoryRepository {
  const isEnvFake = VITE_USE_FAKE_REPOSITORY === "true";
  const isQueryFake =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("fake") === "true";

  if (isEnvFake || isQueryFake) {
    return new FakeCommitHistoryRepository();
  }
  return new CommitHistoryAdapter();
}
