import { Pool } from "pg";
import { DBCommitsRepository } from "../../../../src/modules/TDDCycles/Repositories/DBCommitsRepository";
import { commitsFromGithub, tddCycleDataObjectMock, unsavedCommits } from "../../../__mocks__/TDDCycles/dataTypeMocks/commitData";

let commitRepository: DBCommitsRepository;
let poolCommitConnectMock: jest.Mock;
let clientCommitQueryMock: jest.Mock;

function testErrorHandling(methodUnderTest: () => Promise<any>) {
    it("should handle errors", async () => {
        clientCommitQueryMock.mockRejectedValue(new Error());
        await expect(methodUnderTest()).rejects.toThrow();
    });
}

beforeEach(() => {
    poolCommitConnectMock = jest.fn();
    clientCommitQueryMock = jest.fn();
    poolCommitConnectMock.mockResolvedValue({
        query: clientCommitQueryMock,
        release: jest.fn(),
    });
    jest.spyOn(Pool.prototype, "connect").mockImplementation(poolCommitConnectMock);
    commitRepository = new DBCommitsRepository();
});

afterEach(() => {
    jest.restoreAllMocks();
});


describe("Save Commits", () => {
    it("should save a commit", async () => {
        await commitRepository.saveCommit('owner', 'repo', tddCycleDataObjectMock);
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
        expect(poolCommitConnectMock).toBeCalledTimes(1);
        expect(clientCommitQueryMock).toBeCalledWith('INSERT INTO commitsTable (owner, repoName, html_url, sha, total, additions, deletions, message,url, comment_count, commit_date, coverage, test_count) VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11, $12, $13)', values);
    });
    testErrorHandling(() => commitRepository.saveCommit('owner', 'repo', tddCycleDataObjectMock));
});

describe("Get Commits", () => {
    it('should get commits', async () => {
        clientCommitQueryMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const jobs = await commitRepository.getCommits('owner', 'repo');
        expect(poolCommitConnectMock).toBeCalledTimes(1);
        expect(clientCommitQueryMock).toBeCalledWith('SELECT * FROM commitsTable WHERE owner = $1 AND reponame = $2 ORDER BY commit_date DESC', ['owner', 'repo']);
        expect(jobs).toEqual([{ id: 1 }]);
    });
    testErrorHandling(() => commitRepository.getCommits('owner', 'repo'));
});

describe("Commit Exists", () => {
    it('should check if commit exists', async () => {
        clientCommitQueryMock.mockResolvedValueOnce({ rows: [{ exists: true }] });
        const exists = await commitRepository.commitExists('owner', 'repo', 'sha');
        expect(poolCommitConnectMock).toBeCalledTimes(1);
        expect(clientCommitQueryMock).toBeCalledWith('SELECT * FROM commitstable WHERE owner = $1 AND reponame = $2 AND sha=$3', ['owner', 'repo', 'sha']);
        expect(exists).toEqual(true);
    });
    testErrorHandling(() => commitRepository.commitExists('owner', 'repo',  'sha'));
});


describe("Repository Existence", () => {
    it('should check if repository exists', async () => {
        clientCommitQueryMock.mockResolvedValueOnce({ rows: [{ count: "1" }] });
        const exists = await commitRepository.repositoryExists('owner', 'repo');
        expect(poolCommitConnectMock).toBeCalledTimes(1);
        expect(clientCommitQueryMock).toBeCalledWith('SELECT COUNT(*) FROM commitstable WHERE owner = $1 AND reponame = $2', ['owner', 'repo']);
        expect(exists).toEqual(true);
    });
    testErrorHandling(() => commitRepository.repositoryExists('owner', 'repo'));
});
describe("getCommitsNotSaved", () => {
    it("should return commits that are not saved in the database", async () => {
        clientCommitQueryMock.mockResolvedValueOnce({ rows: [] });
        const result = await commitRepository.getCommitsNotSaved("owner", "repoName", commitsFromGithub);
        expect(poolCommitConnectMock).toBeCalledTimes(1);
        expect(clientCommitQueryMock).toHaveBeenNthCalledWith(1, 'SELECT * FROM commitstable WHERE owner = $1 AND reponame = $2 AND sha=$3', ["owner", "repoName", commitsFromGithub[0].sha]);
        expect(result).toEqual(unsavedCommits);
    });
    it("should stop checking for commits if a commit already exists", async () => {
        const owner = "owner";
        const repoName = "repoName";

        const nonExistingCommits: any[] = [];

        // Mock the commitExists method to return true for the second commit
        jest.spyOn(commitRepository, "commitExists")
            .mockResolvedValueOnce(true);

        const result = await commitRepository.getCommitsNotSaved(owner, repoName, commitsFromGithub);

        expect(result).toEqual(nonExistingCommits);
    });
});
describe("Commit Saving Commits List", () => {
    it('should save commits list', async () => {
        await commitRepository.saveCommitsList('owner', 'repo', [tddCycleDataObjectMock]);
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
        expect(poolCommitConnectMock).toBeCalledTimes(1);
        expect(clientCommitQueryMock).toHaveBeenNthCalledWith(1, 'INSERT INTO commitsTable (owner, repoName, html_url, sha, total, additions, deletions, message,url, comment_count, commit_date, coverage, test_count) VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11, $12, $13)', values);
    });

    it("should handle errors while saving commits", async () => {
        const owner = "owner";
        const repoName = "repo";
        const error = new Error("Failed to save commit");
        
        jest.spyOn(commitRepository, "saveCommit").mockRejectedValueOnce(error);

        await expect(commitRepository.saveCommitsList(owner, repoName, [tddCycleDataObjectMock])).rejects.toThrowError(error);
    });
});

