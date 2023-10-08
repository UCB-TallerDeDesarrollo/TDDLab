export interface CommitDataObject {
    html_url:string;
    stats:Stats;
    commit:Commit;
    sha:string;
}
export interface Stats {
    total:     number;
    additions: number;
    deletions: number; 
}
export interface Commit {
    date:  Date;
    message:       string;
    url:           string;
    comment_count: number;
}
/////////////////
export interface CommitInformationDataObject {
    sha:          string;
    node_id:      string;
    commit:       Commit;
    url:          string;
    html_url:     string;
    comments_url: string;
    author:       GithubAuthor|null;
    committer:    GithubAuthor|null;
    parents:      Parent[];
    stats:        Stats;
    files:        File[];
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
    total:     number;
    additions: number;
    deletions: number; 
}

export interface GithubAuthor {
    login:               string;
    id:                  number;
    node_id:             string;
    avatar_url:          string;
    gravatar_id:         string;
    url:                 string;
    html_url:            string;
    followers_url:       string;
    following_url:       string;
    gists_url:           string;
    starred_url:         string;
    subscriptions_url:   string;
    organizations_url:   string;
    repos_url:           string;
    events_url:          string;
    received_events_url: string;
    type:                string;
    site_admin:          boolean;
}

export interface Commit {
    author:        CommitAuthor;
    committer:     CommitAuthor;
    message:       string;
    tree:          Tree;
    url:           string;
    comment_count: number;
    verification:  Verification;
}

export interface CommitAuthor {
    name:  string;
    email: string;
    date:  Date;
}

export interface Tree {
    sha: string;
    url: string;
}

export interface Verification {
    verified:  boolean;
    reason:    string;
    signature: null;
    payload:   null;
}

export interface Parent {
    sha:      string;
    url:      string;
    html_url: string;
}


