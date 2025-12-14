import { ITestRun } from "./ITestRun";

export interface IDBCommit {
    sha: string; 
    branch: string;
    repo_name: string;
    user_id: string;
    author: string;
    commit: {
        date: Date;
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
    test_run?: ITestRun;
}
