export interface IDBCommit {
    _id: string; // sha
    branch: string;
    repo_name: string;
    user_id: string;
    author: string;
    commit: {
        date: string;
        message: string;
        url: string;
    };
    stats: {
        additions: number;
        deletions: number;
        total: number;
        date: string; // YYYY-MM-DD
    };
    coverage: number;
    test_count: number;
    failed_tests: number;
    conclusion: string;
}

export interface IDBBranchWithCommits {
    _id: string;
    user_id: string;
    repo_name: string;
    branch_name: string;
    commits: IDBCommit[];
    last_commit: string;
    updated_at: Date;
}
