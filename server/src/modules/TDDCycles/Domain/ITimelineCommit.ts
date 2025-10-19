export interface ITimelineEntry {
    execution_id: null;
    commit_sha: string;
    execution_timestamp: Date;
    number_of_tests: number;
    passed_tests: number;
    color: string;
    repoName: string,
    repoOwner: string;
}