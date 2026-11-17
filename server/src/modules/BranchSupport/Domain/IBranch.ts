export interface Branch {
  id: string;
  project_id: string;
  name: string;
  head_commit_sha?: string | null;
  fork_commit_sha?: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface CreateBranchDTO {
  project_id: string;
  name: string;
  head_commit_sha?: string | null;
  fork_commit_sha?: string | null;
}

export interface UpdateBranchDTO {
  name?: string;
  head_commit_sha?: string | null;
  fork_commit_sha?: string | null;
}
