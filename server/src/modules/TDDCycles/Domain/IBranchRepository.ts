import { Pool } from "pg";
import { BranchData } from "./BranchData";
import { BranchHistoryData } from "./BranchData";
import { MergeInfo } from "./IMergeInfo";
import { RepositorySata } from "./IRepositoryData";
import {
  TddRepositoryRequest,
  TddRepositoryResponse,
  TddBranchRequest,
  TddCommitRequest,
  TddMergeRequest,
} from "./InputModels";

export interface IBranchRepository {
  pool: Pool;
  repositoryExists(slug: string): Promise<boolean>;
  saveRepository(repo: TddRepositoryRequest): Promise<TddRepositoryResponse>;
  getRepository(slug: string): Promise<RepositorySata | null>;
  saveBranch(branch: TddBranchRequest): Promise<string>;
  getBranches(repositorySlug: string): Promise<BranchData[]>;
  getBranchByName(repositorySlug: string, branchName: string): Promise<BranchData | null>;
  saveCommit(commit: TddCommitRequest): Promise<void>;
  saveMerge(merge: TddMergeRequest): Promise<number>;
  getMerges(repositorySlug: string): Promise<MergeInfo[]>;
  getBranchHistory(owner: string, repoName: string, branch: string): Promise<BranchHistoryData | null>;
}
