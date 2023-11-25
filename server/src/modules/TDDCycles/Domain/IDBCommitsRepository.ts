import { Pool } from "pg";
import { CommitDTO } from "./CommitDataObject";
import { CommitDataObject } from "./commitInterfaces";

export interface IDBCommitsRepository {
  pool: Pool;
  saveCommit(owner: string, repoName: string, commit: CommitDTO): Promise<any>;
  getCommits(owner: string, repoName: string): Promise<any>;
  commitExists(owner: string, repoName: string, sha: string): Promise<any>;
  repositoryExists(owner: string, repoName: string): Promise<boolean>;
  getCommitsNotSavedInDB(owner: string, repoName: string, commitsData: CommitDataObject[]): Promise<CommitDataObject[]>;
}
