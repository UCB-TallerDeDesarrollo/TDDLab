export interface CommitDataObject {
  sha: string;
  node_id: string;
  commit: Commit;
  url: string;
  html_url: string;
  comments_url: string;
  author: GithubAuthor | null;
  committer: GithubAuthor | null;
  parents: Parent[];
}

export interface CommitInformationDataObject extends CommitDataObject {
  stats: Stats;
  files: File[];
  coveragePercentage: string;
  test_count: string;
}

export interface File {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch: string;
}

export interface Stats {
  total: number;
  additions: number;
  deletions: number;
}

export interface GithubAuthor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface Commit {
  author: CommitAuthor;
  committer: CommitAuthor;
  message: string;
  tree: Tree;
  url: string;
  comment_count: number;
  verification: Verification;
}

export interface CommitAuthor {
  name: string;
  email: string;
  date: Date;
}

export interface Tree {
  sha: string;
  url: string;
}

export interface Verification {
  verified: boolean;
  reason: string;
  signature: null;
  payload: null;
}

export interface Parent {
  sha: string;
  url: string;
  html_url: string;
}

export interface CoverageComment {
  url: string;
  html_url: string;
  id: number;
  node_id: string;
  user: GithubAuthor;
  position: null | string;
  line: null | string;
  path: null | string;
  commit_id: string;
  created_at: string;
  updated_at: string;
  author_association: string;
  body: string;
  reactions: {
    url: string;
    total_count: number;
    "+1": number;
    "-1": number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
}