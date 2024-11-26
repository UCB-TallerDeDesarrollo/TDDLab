import { Pool } from "pg";
import { TDDCycleDataObject } from "./TDDCycleDataObject";
import { CommitDataObject } from "./CommitDataObject";

export interface IDBCommitsRepository {
  pool: Pool;
  saveCommit(owner: string, repoName: string, commit: TDDCycleDataObject): Promise<any>;
  getCommits(owner: string, repoName: string): Promise<any>;
  commitExists(owner: string, repoName: string, sha: string): Promise<any>;
  repositoryExists(owner: string, repoName: string): Promise<boolean>;
  getCommitsNotSaved(owner: string, repoName: string, commitsData: CommitDataObject[]): Promise<CommitDataObject[]>;
  saveCommitsList(owner: string, repoName: string, newCommits: TDDCycleDataObject[]): Promise<void>;
  updateCommitCoverageAndTestCount(owner: string, repoName: string, sha: string, coverage: string, test_count: string) : Promise<any>;
  updateTddCycle(sha: string, tdd_cicle:boolean) : Promise<any>;
}
