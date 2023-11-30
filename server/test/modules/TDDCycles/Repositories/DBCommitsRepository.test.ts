
import { Pool } from "pg";
import { DBCommitsRepository } from "../../../../src/modules/TDDCycles/Repositories/DBCommitsRepository";
import { commitsFromGithub, tddCycleDataObjectMock, unsavedCommits } from "../../../__mocks__/TDDCycles/dataTypeMocks/commitData";

let repository: DBCommitsRepository;
let poolConnectMock: jest.Mock;
let clientQueryMock: jest.Mock;

beforeEach(() => {
    poolConnectMock = jest.fn();
    clientQueryMock = jest.fn();
    poolConnectMock.mockResolvedValue({
        query: clientQueryMock,
        release: jest.fn(),
    });
    jest.spyOn(Pool.prototype, "connect").mockImplementation(poolConnectMock);
    repository = new DBCommitsRepository();
});

afterEach(() => {
    jest.restoreAllMocks();
});


describe("Save Commits", () => {
    it("should save a commit", async () => {
        await repository.saveCommit('owner', 'repo', tddCycleDataObjectMock);
        const values = [
            "owner",
            "repo",
            tddCycleDataObjectMock.html_url,
            tddCycleDataObjectMock.sha,
            tddCycleDataObjectMock.stats.total,
            tddCycleDataObjectMock.stats.additions,
            tddCycleDataObjectMock.stats.deletions,
            tddCycleDataObjectMock.commit.message,
            tddCycleDataObjectMock.commit.url,
            tddCycleDataObjectMock.commit.comment_count,
            tddCycleDataObjectMock.commit.date,
            tddCycleDataObjectMock.coverage,
            tddCycleDataObjectMock.test_count
        ];
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('INSERT INTO commitsTable (owner, repoName, html_url, sha, total, additions, deletions, message,url, comment_count, commit_date, coverage, test_count) VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11, $12, $13)', values);
    });
    it("should handle errors when saving a commit", async () => {
        clientQueryMock.mockRejectedValue(new Error());
        await expect(
            repository.saveCommit('owner', 'repo', tddCycleDataObjectMock)
        ).rejects.toThrow();
    });
});

describe("Get Commits", () => {
    it('should get commits', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const jobs = await repository.getCommits('owner', 'repo');
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT * FROM commitsTable WHERE owner = $1 AND reponame = $2 ORDER BY commit_date DESC', ['owner', 'repo']);
        expect(jobs).toEqual([{ id: 1 }]);
    });
    it("should handle errors when getting a commit", async () => {
        clientQueryMock.mockRejectedValue(new Error());
        await expect(
            repository.getCommits('owner', 'repo')
        ).rejects.toThrow();
    });
});

describe("Commit Exists", () => {
    it('should check if commit exists', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ exists: true }] });
        const exists: Boolean = await repository.commitExists('owner', 'repo', 'sha');
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT * FROM commitstable WHERE owner = $1 AND reponame = $2 AND sha=$3', ['owner', 'repo', 'sha']);
        expect(exists).toEqual(true);
    });
    it("should handle errors checking if commit exists", async () => {
        clientQueryMock.mockRejectedValue(new Error());
        await expect(
            repository.commitExists('owner', 'repo',  'sha')
        ).rejects.toThrow();
    });
});


describe("Repository Existence", () => {
    it('should check if repository exists', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ count: "1" }] });
        const exists: Boolean = await repository.repositoryExists('owner', 'repo');
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT COUNT(*) FROM commitstable WHERE owner = $1 AND reponame = $2', ['owner', 'repo']);
        expect(exists).toEqual(true);
    });
    it("should handle errors when checking repository existence", async () => {
        clientQueryMock.mockRejectedValue(new Error());
        await expect(
            repository.repositoryExists('owner', 'repo')
        ).rejects.toThrow();
    });
});
describe("getCommitsNotSaved", () => {
    it("should return commits that are not saved in the database", async () => {
        const owner = "owner";
        const repoName = "repoName";

        clientQueryMock.mockResolvedValueOnce({ rows: [] });

        const result = await repository.getCommitsNotSaved(owner, repoName, commitsFromGithub);

        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toHaveBeenNthCalledWith(1, 'SELECT * FROM commitstable WHERE owner = $1 AND reponame = $2 AND sha=$3', [owner, repoName, commitsFromGithub[0].sha]);
        expect(result).toEqual(unsavedCommits);
    });
});
describe("Commit Saving Commits List", () => {
    it('should save commits list', async () => {
        await repository.saveCommitsList('owner', 'repo', [tddCycleDataObjectMock]);
        const values = [
            "owner",
            "repo",
            tddCycleDataObjectMock.html_url,
            tddCycleDataObjectMock.sha,
            tddCycleDataObjectMock.stats.total,
            tddCycleDataObjectMock.stats.additions,
            tddCycleDataObjectMock.stats.deletions,
            tddCycleDataObjectMock.commit.message,
            tddCycleDataObjectMock.commit.url,
            tddCycleDataObjectMock.commit.comment_count,
            tddCycleDataObjectMock.commit.date,
            tddCycleDataObjectMock.coverage,
            tddCycleDataObjectMock.test_count
        ];
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toHaveBeenNthCalledWith(1, 'INSERT INTO commitsTable (owner, repoName, html_url, sha, total, additions, deletions, message,url, comment_count, commit_date, coverage, test_count) VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11, $12, $13)', values);
    });
});

