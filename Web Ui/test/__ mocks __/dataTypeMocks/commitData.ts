import { CommitDataObject } from "../../../src/TDD-Visualization/domain/githubCommitInterfaces";

export const mockCommitData: CommitDataObject = {
  sha: "mockSha",
  node_id: "mockNodeId",
  commit: {
    author: {
      name: "Mock Author",
      email: "author@example.com",
      date: new Date("2023-09-13T12:00:00Z"),
    },
    committer: {
      name: "Mock Committer",
      email: "committer@example.com",
      date: new Date("2023-09-13T12:00:00Z"),
    },
    message: "Mock commit message",
    tree: {
      sha: "mockTreeSha",
      url: "mockTreeUrl",
    },
    url: "mockCommitUrl",
    comment_count: 0,
    verification: {
      verified: false,
      reason: "unsigned",
      signature: null,
      payload: null,
    },
  },
  url: "mockUrl",
  html_url: "mockHtmlUrl",
  comments_url: "mockCommentsUrl",
  author: null,
  committer: null,
  parents: [],
};
