import {
    Commit, 
    CommitAuthor, 
    CommitDataObject, 
    CommitInformationDataObject, 
    CoverageComment, 
    GithubAuthor, 
    Parent, 
    Stats, 
    Tree, 
    Verification,
    File
} from "../../../../src/modules/Github/Domain/commitInterfaces"

export const mockCommitDataObject: CommitDataObject = {
  sha: "mockSha",
  node_id: "mockNodeId",
  commit: {
    author: {
      name: "Author Name",
      email: "author@email.com",
      date: new Date("2023-01-01"),
    },
    committer: {
      name: "Committer Name",
      email: "committer@email.com",
      date: new Date("2023-01-01"),
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

export const mockCommitInformationDataObject: CommitInformationDataObject = {
  ...mockCommitDataObject,
  stats: {
    total: 10,
    additions: 5,
    deletions: 5,
  },
  files: [
    {
      sha: 'fileSha',
      filename: 'file.txt',
      status: 'added',
      additions: 2,
      deletions: 1,
      changes: 3,
      blob_url: 'mockBlobUrl',
      raw_url: 'mockRawUrl',
      contents_url: 'mockContentsUrl',
      patch: 'mockPatch',
    },
  ],
  coveragePercentage: '90%',
};

export const mockGithubAuthor: GithubAuthor = {
  login: 'mockLogin',
  id: 123,
  node_id: 'mockNodeId',
  avatar_url: 'mockAvatarUrl',
  gravatar_id: 'mockGravatarId',
  url: 'mockUrl',
  html_url: 'mockHtmlUrl',
  followers_url: 'mockFollowersUrl',
  following_url: 'mockFollowingUrl',
  gists_url: 'mockGistsUrl',
  starred_url: 'mockStarredUrl',
  subscriptions_url: 'mockSubscriptionsUrl',
  organizations_url: 'mockOrganizationsUrl',
  repos_url: 'mockReposUrl',
  events_url: 'mockEventsUrl',
  received_events_url: 'mockReceivedEventsUrl',
  type: 'user',
  site_admin: false,
};

export const mockCommit: Commit = {
  author: {
    name: "Author Name",
    email: "author@email.com",
    date: new Date("2023-01-01"),
  },
  committer: {
    name: "Committer Name",
    email: "committer@email.com",
    date: new Date("2023-01-01"),
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
};

export const mockCommitAuthor: CommitAuthor = {
  name: "Author Name",
  email: "author@email.com",
  date: new Date("2023-01-01"),
};

export const mockTree: Tree = {
  sha: "mockTreeSha",
  url: "mockTreeUrl",
};

export const mockVerification: Verification = {
  verified: false,
  reason: "unsigned",
  signature: null,
  payload: null,
};

export const mockParent: Parent = {
  sha: "parentSha",
  url: "parentUrl",
  html_url: "parentHtmlUrl",
};

export const mockStats: Stats = {
  total: 10,
  additions: 5,
  deletions: 5,
};

export const mockFile: File = {
  sha: "fileSha",
  filename: "file.txt",
  status: "added",
  additions: 2,
  deletions: 1,
  changes: 3,
  blob_url: "mockBlobUrl",
  raw_url: "mockRawUrl",
  contents_url: "mockContentsUrl",
  patch: "mockPatch",
};

export const mockCoverageComment: CoverageComment = {
  url: "mockCommentUrl",
  html_url: "mockCommentHtmlUrl",
  id: 1,
  node_id: "mockCommentNodeId",
  user: mockGithubAuthor,
  position: null,
  line: null,
  path: "mockCommentPath",
  commit_id: "mockCommentCommitId",
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  author_association: "COLLABORATOR",
  body: "Mock comment body",
  reactions: {
    url: "mockReactionsUrl",
    total_count: 0,
    "+1": 0,
    "-1": 0,
    laugh: 0,
    hooray: 0,
    confused: 0,
    heart: 0,
    rocket: 0,
    eyes: 0,
  },
};
