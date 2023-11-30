
import { Pool } from "pg";
import { DBCommitsRepository } from "../../../../src/modules/TDDCycles/Repositories/DBCommitsRepository";
import { tddCycleDataObjectMock } from "../../../__mocks__/TDDCycles/dataTypeMocks/commitData";

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


describe("Obtain Commits", () => {
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
    it('should get commits', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const jobs = await repository.getCommits('owner', 'repo');
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT * FROM commitsTable WHERE owner = $1 AND reponame = $2 ORDER BY commit_date DESC', ['owner', 'repo']);
        expect(jobs).toEqual([{ id: 1 }]);
    });
});
describe("Commit and Repository Existence", () => {
    it('should check if commit exists', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ exists: true }] });
        const exists: Boolean = await repository.commitExists('owner', 'repo', 'sha');
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT * FROM commitstable WHERE owner = $1 AND reponame = $2 AND sha=$3', ['owner', 'repo', 'sha']);
        expect(exists).toEqual(true);
    });

    it('should check if repository exists', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ count: "1" }] });
        const exists: Boolean = await repository.repositoryExists('owner', 'repo');
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT COUNT(*) FROM commitstable WHERE owner = $1 AND reponame = $2', ['owner', 'repo']);
        expect(exists).toEqual(true);
    });
});
