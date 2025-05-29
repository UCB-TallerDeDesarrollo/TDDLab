export interface CommitDataObject {
    sha: string;
    author: string;
    commit: {
      date: Date;
      message: string;
      url: string;
    };
    stats: {
      total: number;
      additions: number;
      deletions: number;
      date: string;
    };
    coverage: number;
    test_count: number;
    failed_tests: number;
    conclusion: string;
}