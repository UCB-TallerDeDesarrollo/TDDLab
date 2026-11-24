export interface TddExecutionRequest {
  testsTotal: number;
  testsPassed: number;
  testsFailed: number;
  executedAt: string;
}

export interface TddCommitRequest {
  repositorySlug: string;
  commitSha: string;
  parentCommitSha?: string;
  branch: string;
  authorName: string;
  message: string;
  commitedAt: string;
  tddExecutions: TddExecutionRequest[];
}

export interface TddBranchRequest {
  repositorySlug: string;
  name: string;
  forkCommitSha?: string;
  createdAt: string;
}

export interface TddMergeRequest {
  repositorySlug: string;
  sourceBranch: string;
  targetBranch: string;
  sourceCommitSha: string;
  mergeCommitSha: string;
  isFastForward: boolean;
  mergedAt: string;
}

export interface TddRepositoryRequest {
  slug: string;
  remoteUrl?: string;
}

export interface TddRepositoryResponse {
  id: number;
  slug: string;
  remoteUrl?: string;
  createdAt: string;
}

export interface TddBranchPushRequest {
  repository: TddRepositoryRequest;
  branches: TddBranchRequest[];
  commits: TddCommitRequest[];
  merges: TddMergeRequest[];
}

export interface TddBranchPushResponse {
  repository: TddRepositoryResponse;
  branchesSaved: number;
  commitsSaved: number;
  mergesSaved: number;
  executionsSaved: number;
}
