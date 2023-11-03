import { CommitDataObject } from "../../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

export const mockCommitData: CommitDataObject = {
  html_url: "https://github.com/user2/repo2/commit/1234",
  sha: "98765abcdef",
  stats: { total: 5, additions: 4, deletions: 1 },
  commit: {
    date: new Date("2023-10-07T09:45:00.000Z"),
    message: "Commit Mock commit message",
    url: "https://github.com/user2/repo2/commit/98765",
    comment_count: 2,
  },
  coverage: 80
};

export const mockArrayCommitData: CommitDataObject[] = [{
  html_url: "https://github.com/user2/repo2/commit/1234",
  sha: "98765abcdef",
  stats: { total: 5, additions: 4, deletions: 1 },
  commit: {
    date: new Date("2023-10-07T09:45:00.000Z"),
    message: "Commit Mock commit message",
    url: "https://github.com/user2/repo2/commit/98765",
    comment_count: 2,
  },
  coverage: 100
}];