export interface ITestRunResult {
    execution_timestamp: number;
    summary: {
        passed: number;
        failed: number;
        total: number;
    };
    success: boolean;
    test_id: number;
}

export interface ITestRun {
    id: string;
    commit_sha: string;
    branch: string;
    user_id: string;
    repo_name: string;
    runs: ITestRunResult[];
}
