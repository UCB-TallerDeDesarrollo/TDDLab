import { Pool } from "pg";
import { CommitDTO } from "./CommitDataObject";

export interface ICommitRepository {
    pool: Pool;
    saveCommitInfoOfRepo(owner: string, repoName: string, commit: CommitDTO): Promise<any>;
    getCommits(owner: String, repoName: String): Promise<any>;
    commitExists(owner: string, repoName: string, sha: string): Promise<any>;
    repositoryExist(owner: string, repoName: string): Promise<boolean>;
}