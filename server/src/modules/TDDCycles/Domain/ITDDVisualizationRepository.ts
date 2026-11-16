import { CommitCycleData } from "./ICommitCycleData";
import { CommitHistoryData } from "./ICommitHistoryData";
import { TDDLogEntry } from "./TDDLogEntry";

export interface ITDDVisualizationRepository {
  getCommitHistoryData(owner: string, repoName: string): Promise<CommitHistoryData[]>;
  getCommitCyclesData(owner: string, repoName: string): Promise<CommitCycleData[]>;
  getTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]>;
}
