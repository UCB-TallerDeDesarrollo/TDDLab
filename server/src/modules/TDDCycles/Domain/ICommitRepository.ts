import { Pool } from "pg";
import { CommitDTO } from "./CommitDataObject";

export interface ICommitRepository {
  pool: Pool;
  saveCommit(owner: string, repoName: string, commit: CommitDTO): Promise<any>;
  getCommits(owner: string, repoName: string): Promise<any>;
  commitExists(owner: string, repoName: string, sha: string): Promise<any>;
  repositoryExists(owner: string, repoName: string): Promise<boolean>;
}
