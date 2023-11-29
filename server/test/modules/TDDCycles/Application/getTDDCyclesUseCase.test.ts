import { GetTDDCyclesUseCase } from "../../../../src/modules/TDDCycles/Application/getTDDCyclesUseCase";
import { CommitDataObject } from "../../../../src/modules/TDDCycles/Domain/CommitDataObject";
import { IDBCommitsRepository } from "../../../../src/modules/TDDCycles/Domain/IDBCommitsRepository";
import { IGithubRepository } from "../../../../src/modules/TDDCycles/Domain/IGithubRepository";
import { TDDCycleDataObject } from "../../../../src/modules/TDDCycles/Domain/TDDCycleDataObject";


const commitsFromGithub: CommitDataObject[] = [{
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

const tddCycleDataObjectMock: TDDCycleDataObject = {
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

const unsavedCommits: CommitDataObject[] = [{
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

jest.mock("../../../../src/modules/TDDCycles/Domain/IDBCommitsRepository", () => {
    return jest.fn().mockImplementation(() => {
        return {
            repositoryExists: jest.fn(),
            getCommits: jest.fn(),
            saveCommitsList: jest.fn(),
            getCommitsNotSaved: jest.fn(),
        };
    });
});
jest.mock("../../../../src/modules/TDDCycles/Domain/IGithubRepository", () => {
    return jest.fn().mockImplementation(() => {
        return {
            getCommits: jest.fn(),
            getCommitsInforForTDDCycle: jest.fn(),
        };
    });
});

describe("GetTDDCyclesUseCase", () => {
    let dbCommitRepository: jest.Mocked<IDBCommitsRepository>;
    let githubRepository: jest.Mocked<IGithubRepository>;
    let useCase: GetTDDCyclesUseCase;

    beforeEach(() => {
        dbCommitRepository = new (require("../../../../src/modules/TDDCycles/Domain/IDBCommitsRepository"))();
        githubRepository = new (require("../../../../src/modules/TDDCycles/Domain/IGithubRepository"))();
        useCase = new GetTDDCyclesUseCase(dbCommitRepository, githubRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch commits from Github, get their info for TDD cycles, save them in the database, and return them when the repository does not exist in the database", async () => {
        const owner = "owner";
        const repoName = "repoName";
        

        dbCommitRepository.repositoryExists.mockResolvedValue(false);
        githubRepository.getCommits.mockResolvedValue(commitsFromGithub);
        githubRepository.getCommitsInforForTDDCycle.mockResolvedValue([tddCycleDataObjectMock]);
        dbCommitRepository.getCommits.mockResolvedValue([tddCycleDataObjectMock]);

        const result = await useCase.execute(owner, repoName);

        expect(dbCommitRepository.repositoryExists).toHaveBeenCalledWith(owner, repoName);
        expect(githubRepository.getCommits).toHaveBeenCalledWith(owner, repoName);
        expect(githubRepository.getCommitsInforForTDDCycle).toHaveBeenCalledWith(owner, repoName, commitsFromGithub);
        expect(dbCommitRepository.saveCommitsList).toHaveBeenCalledWith(owner, repoName, [tddCycleDataObjectMock]);
        expect(dbCommitRepository.getCommits).toHaveBeenCalledWith(owner, repoName);
        expect(result).toEqual([tddCycleDataObjectMock]);
    });

    it("should fetch commits from Github, get their info for TDD cycles, save only the unsaved commits in the database, and return them when the repository exists in the database", async () => {
        const owner = "owner";
        const repoName = "repoName";

        dbCommitRepository.repositoryExists.mockResolvedValue(true);
        githubRepository.getCommits.mockResolvedValue(commitsFromGithub);
        dbCommitRepository.getCommitsNotSaved.mockResolvedValue(unsavedCommits);
        githubRepository.getCommitsInforForTDDCycle.mockResolvedValue([tddCycleDataObjectMock]);
        dbCommitRepository.getCommits.mockResolvedValue([tddCycleDataObjectMock]);

        const result = await useCase.execute(owner, repoName);

        expect(dbCommitRepository.repositoryExists).toHaveBeenCalledWith(owner, repoName);
        expect(githubRepository.getCommits).toHaveBeenCalledWith(owner, repoName);
        expect(dbCommitRepository.getCommitsNotSaved).toHaveBeenCalledWith(owner, repoName, commitsFromGithub);
        expect(githubRepository.getCommitsInforForTDDCycle).toHaveBeenCalledWith(owner, repoName, unsavedCommits);
        expect(dbCommitRepository.saveCommitsList).toHaveBeenCalledWith(owner, repoName, [tddCycleDataObjectMock]);
        expect(dbCommitRepository.getCommits).toHaveBeenCalledWith(owner, repoName);
        expect(result).toEqual([tddCycleDataObjectMock]);
    });

    it("should throw an error when there is an issue with fetching or saving commits", async () => {
        const owner = "owner";
        const repoName = "repoName";

        githubRepository.getCommits.mockRejectedValue(new Error("Error fetching commits"));

        await expect(useCase.execute(owner, repoName)).rejects.toThrow("Error fetching commits");
    });

});