export interface CommitHistoryData {
  html_url: string;
  sha: string;
  stats: {
    total: number;
    additions: number;
    deletions: number;
    date: string;
  };
  commit: {
    date: Date;
    message: string;
    url: string;
    comment_count: number;
  };
  coverage: number;
  test_count: number;
  conclusion: string;
}
