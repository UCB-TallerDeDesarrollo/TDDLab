export interface IDBBranch {
    _id: string;
    user_id: string;
    repo_name: string;
    branch_name: string;
    commits: string[]; // Array of SHAs
    last_commit: string;
    updated_at: Date;
}
