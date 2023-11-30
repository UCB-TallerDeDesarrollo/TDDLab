import { CommitDataObject } from "../../../../src/modules/TDDCycles/Domain/CommitDataObject";
import { TDDCycleDataObject } from "../../../../src/modules/TDDCycles/Domain/TDDCycleDataObject";

export const commitsFromGithub: CommitDataObject[] = [{
    sha: 'abc123',
    node_id: 'node1',
    commit: {
        message: 'test commit',
        author: {
            name: 'John Doe',
            email: 'johndoe@example.com',
            date: new Date('2022-01-01T00:00:00Z')
        },
        committer: {
            name: 'Jane Smith',
            email: 'janesmith@example.com',
            date: new Date('2022-01-01T00:00:00Z')
        },
        tree: {
            sha: 'tree1',
            url: 'tree_url'
        },
        url: 'commit_url',
        comment_count: 0,
        verification: {
            verified: false,
            reason: 'reason',
            signature: null,
            payload: null
        }
    },
    url: 'url',
    html_url: 'https://github.com/user/repo/commit/abc123',
    comments_url: 'comments_url',
    author: null,
    committer: null,
    parents: []
}];

export const tddCycleDataObjectMock: TDDCycleDataObject = {
    html_url: 'https://github.com/user/repo/commit/abc123',
    stats: {
        total: 100,
        additions: 50,
        deletions: 50
    },
    commit: {
        date: new Date('2022-01-01T00:00:00Z'),
        message: 'test commit',
        url: 'commit_url',
        comment_count: 0
    },
    sha: 'abc123',
    coverage: '80%',
    test_count: '50'
};

export const unsavedCommits: CommitDataObject[] = commitsFromGithub;