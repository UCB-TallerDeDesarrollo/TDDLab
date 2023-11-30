import { DBJobsRepository } from '../../../../src/modules/TDDCycles/Repositories/DBJobsRepository';
import { Pool } from "pg";

let repository: DBJobsRepository;
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
    repository = new DBJobsRepository();
});

afterEach(() => {
    jest.restoreAllMocks();
});


describe("Obtain assignments", () => {
    it("should save a job", async () => {
        await repository.saveJob({ id: 1, sha: 'sha', owner: 'owner', reponame: 'repo', conclusion: 'success' });
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('INSERT INTO jobsTable (id, sha, owner, repoName, conclusion) VALUES ($1, $2, $3, $4, $5)', [1, 'sha', 'owner', 'repo', 'success']);
    });
    it('should get jobs', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const jobs = await repository.getJobs('owner', 'repo');
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2', ['owner', 'repo']);
        expect(jobs).toEqual([{ id: 1 }]);
    });
});

describe("getJobsNotSaved", () => {
    it("should return jobs that are not saved in the database", async () => {
        const owner = "owner";
        const repoName = "repoName";
        const commitsWithActions: [string, number][] = [["commit1", 1], ["commit2", 2], ["commit3", 3]];
        const jobsNotSaved: [string, number][] = [["commit1", 1], ["commit2", 2], ["commit3", 3]];

        clientQueryMock.mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const result = await repository.getJobsNotSaved(owner, repoName, commitsWithActions);

        expect(poolConnectMock).toBeCalledTimes(3);
        expect(clientQueryMock).toHaveBeenNthCalledWith(1, 'SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3', [owner, repoName, commitsWithActions[0][1]]);
        expect(clientQueryMock).toHaveBeenNthCalledWith(2, 'SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3', [owner, repoName, commitsWithActions[1][1]]);
        expect(clientQueryMock).toHaveBeenNthCalledWith(3, 'SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3', [owner, repoName, commitsWithActions[2][1]]);
        expect(result).toEqual(jobsNotSaved);
    });
});

describe("Job Existence and Saving Jobs List", () => {
    it('should check if job exists', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ exists: true }] });
        const exists = await repository.jobExists('owner', 'repo', 1);
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3', ['owner', 'repo', 1]);
        expect(exists).toEqual(true);
    });
});
