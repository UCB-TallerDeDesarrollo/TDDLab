import { CommitHistoryData } from "./ICommitHistoryData";
import { CommitCycleData } from "./ICommitCycleData";

/** The versioned JSON pair is retained without dropping source fields. */
export interface TDDResultsSnapshot {
  commitHistory: Record<string, any>[];
  tddLog: Record<string, any>[];
}

export interface ITDDResultsRepository {
  getCommitHistoryData(owner: string, repo: string, branch?: string): Promise<CommitHistoryData[]>;
  getCommitCyclesData(owner: string, repo: string, branch?: string): Promise<CommitCycleData[]>;
  getTestLog(owner: string, repo: string, branch?: string): Promise<Record<string, any>[]>;
  getSnapshot(owner: string, repo: string, branch: string): Promise<TDDResultsSnapshot>;
  saveSnapshot(owner: string, repo: string, branch: string, snapshot: TDDResultsSnapshot): Promise<void>;
}
