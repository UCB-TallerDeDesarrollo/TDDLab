export interface GitCommit {
  project_id: string;
  sha: string;
  author: string;
  author_email?: string | null;
  message: string;
  committed_at: Date;
  additions: number;
  deletions: number;
  total_changes?: number;
  changed_files: number;
}

export interface CommitParent {
  project_id: string;
  commit_sha: string;
  parent_sha: string;
  parent_order: number;
}

export interface CreateCommitDTO {
  project_id: string;
  sha: string;
  author: string;
  author_email?: string | null;
  message: string;
  committed_at: string | Date;
  additions?: number;
  deletions?: number;
  changed_files?: number;
  parent_shas?: string[];
  branch_id?: string; // If provided, records in branch_commit and optionally advances branch tip
  update_branch_head?: boolean;
}
