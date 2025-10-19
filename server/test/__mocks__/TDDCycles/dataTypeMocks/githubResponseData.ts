import {
    CommitDataObject,
    CommitInformationDataObject,
} from "../../../../src/modules/TDDCycles/Domain/CommitDataObject";
import { TDDCycleDataObject } from "../../../../src/modules/TDDCycles/Domain/TDDCycleDataObject";

const author = {
    login: "author1",
    id: 1,
    node_id: "author_node1",
    avatar_url: "avatar_url1",
    gravatar_id: "gravatar_id1",
    url: "author_url1",
    html_url: "author_html_url1",
    followers_url: "followers_url1",
    following_url: "following_url1",
    gists_url: "gists_url1",
    starred_url: "starred_url1",
    subscriptions_url: "subscriptions_url1",
    organizations_url: "organizations_url1",
    repos_url: "repos_url1",
    events_url: "events_url1",
    received_events_url: "received_events_url1",
    type: "author_type1",
    site_admin: false,
};

const committer = {
    login: "committer1",
    id: 2,
    node_id: "committer_node1",
    avatar_url: "avatar_url2",
    gravatar_id: "gravatar_id2",
    url: "committer_url1",
    html_url: "committer_html_url1",
    followers_url: "committer_followers_url1",
    following_url: "committer_following_url1",
    gists_url: "committer_gists_url1",
    starred_url: "committer_starred_url1",
    subscriptions_url: "committer_subscriptions_url1",
    organizations_url: "committer_organizations_url1",
    repos_url: "committer_repos_url1",
    events_url: "committer_events_url1",
    received_events_url: "committer_received_events_url1",
    type: "committer_type1",
    site_admin: false,
};
const data = {
    sha: "commit1",
    node_id: "node1",
    url: "url1",
    html_url: "html_url1",
    comments_url: "comments_url1",
    parents: [
        {
            sha: "parent1",
            url: "parent_url1",
            html_url: "parent_html_url1",
        },
    ],
    commit: {
        author: {
            name: "commit_author1",
            email: "commit_author_email1",
            date: new Date(),
        },
        committer: {
            name: "commit_committer1",
            email: "commit_committer_email1",
            date: new Date(),
        },
        message: "commit_message1",
        tree: {
            sha: "tree1",
            url: "tree_url1",
        },
        url: "commit_url1",
        comment_count: 1,
        verification: {
            verified: true,
            reason: "verification_reason1",
            signature: null,
            payload: null,
        },
    },
};

export const githubResponseData = {
    headers: {},
    status: 200,
    url: "https://api.github.com/repos/owner/repoName/commits",
    data: [data],
};

export const githubResponse = {
    headers: {},
    status: 200,
    url: "https://api.github.com/repos/owner/repoName/commits",
    data: [
        {
            ...data,
            author: author,
            committer: committer,
        },
    ],
};

export const githubResponseNoAuthorNoCommitter = {
    headers: {},
    status: 200,
    url: "https://api.github.com/repos/owner/repoName/commits",
    data: [
        {
            ...data,
            author: null,
            committer: null,
        },
    ],
};

export const githubCommitData = {
    sha: "commit1",
    node_id: "node1",
    url: "url1",
    html_url: "html_url1",
    comments_url: "comments_url1",
    parents: [
        {
            sha: "parent1",
            url: "parent_url1",
            html_url: "parent_html_url1",
        },
    ],
    commit: {
        author: {
            name: "commit_author1",
            email: "commit_author_email1",
            date: expect.any(Date),
        },
        committer: {
            name: "commit_committer1",
            email: "commit_committer_email1",
            date: expect.any(Date),
        },
        message: "commit_message1",
        tree: {
            sha: "tree1",
            url: "tree_url1",
        },
        url: "commit_url1",
        comment_count: 1,
        verification: {
            verified: true,
            reason: "verification_reason1",
            signature: null,
            payload: null,
        },
    },
};

export const commitDataObjectMockNoAuthorNoCommiter: CommitDataObject[] = [
    {
        ...githubCommitData,
        author: null,
        committer: null,
    },
];

export const commitDataObjectMock: CommitDataObject[] = [
    {
        ...githubCommitData,
        author: author,
        committer: committer,
    },
];

export const commitInformationDataObjectMock = {
    sha: "commitSha",
    node_id: "nodeId",
    commit: {
        author: {
            name: "Author Name",
            email: "author@example.com",
            date: new Date(),
        },
        committer: {
            name: "Committer Name",
            email: "committer@example.com",
            date: new Date(),
        },
        message: "Commit message",
        tree: {
            sha: "treeSha",
            url: "treeUrl",
        },
        url: "commitUrl",
        comment_count: 0,
        verification: {
            verified: true,
            reason: "valid",
            signature: null,
            payload: null,
        },
    },
    url: "commitUrl",
    html_url: "commitHtmlUrl",
    comments_url: "commentsUrl",
    author: null,
    committer: null,
    parents: [],
    stats: {
        total: 10,
        additions: 5,
        deletions: 5,
    },
    files: [
        {
            sha: "fileSha",
            filename: "file.txt",
            status: "modified",
            additions: 2,
            deletions: 1,
            changes: 3,
            blob_url: "blobUrl",
            raw_url: "rawUrl",
            contents_url: "contentsUrl",
            patch: "filePatch",
        },
    ],
};

export const commitInformationMock: CommitInformationDataObject = {
    ...commitInformationDataObjectMock,
    coveragePercentage: "80",
    test_count: "10",
};

export const tddCycleDataObject: TDDCycleDataObject = {
    commit: {
        comment_count: 0,
        date: new Date(),
        message: "Commit message",
        url: "commitUrl",
    },
    coverage: "80",
    html_url: "commitHtmlUrl",
    sha: "commitSha",
    stats: {
        additions: 5,
        deletions: 5,
        total: 10,
    },
    test_count: "10",
};
