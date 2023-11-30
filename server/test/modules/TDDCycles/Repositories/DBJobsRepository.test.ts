import { DBJobsRepository } from '../../../../src/modules/TDDCycles/Repositories/DBJobsRepository';
import { Pool } from "pg";
import { jobsFormatted } from '../../../__mocks__/TDDCycles/dataTypeMocks/jobData';

let repository: DBJobsRepository;
let poolConnectMock: jest.Mock;
let clientQueryMock: jest.Mock;

function testErrorHandling(methodUnderTest: () => Promise<any>) {
    it("should handle errors", async () => {
        clientQueryMock.mockRejectedValue(new Error());
        await expect(methodUnderTest()).rejects.toThrow();
    });
}

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


describe("Save a job", () => {
    it("should save a job", async () => {
        await repository.saveJob({ id: 1, sha: 'sha', owner: 'owner', reponame: 'repo', conclusion: 'success' });
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('INSERT INTO jobsTable (id, sha, owner, repoName, conclusion) VALUES ($1, $2, $3, $4, $5)', [1, 'sha', 'owner', 'repo', 'success']);
    });
    testErrorHandling(() => repository.saveJob({ id: 1, sha: 'sha', owner: 'owner', reponame: 'repo', conclusion: 'success' }));
});

describe("Get jobs", () => {
    it('should get jobs', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const jobs = await repository.getJobs('owner', 'repo');
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2', ['owner', 'repo']);
        expect(jobs).toEqual([{ id: 1 }]);
    });
    testErrorHandling(() => repository.getJobs('owner', 'repo'));
});

describe("JobExists", () => {
    it('should check if job exists', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ exists: true }] });
        const exists = await repository.jobExists('owner', 'repo', 1);
        expect(poolConnectMock).toBeCalledTimes(1);
        expect(clientQueryMock).toBeCalledWith('SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3', ['owner', 'repo', 1]);
        expect(exists).toEqual(true);
    });
    testErrorHandling(() => repository.jobExists('owner', 'repo', 1));
});

describe("RepositoryExists", () => {
    it('should check if job exists', async () => {
        clientQueryMock.mockResolvedValueOnce({ rows: [{ count: "1" }] });
        const exists = await repository.repositoryExists('owner', 'repo');
        expect(poolConnectMock).toBeCalledTimes(1);
        const repositoryExistsQuery = 'SELECT COUNT(*) FROM jobsTable WHERE owner = $1 AND reponame = $2';
        expect(clientQueryMock).toBeCalledWith(repositoryExistsQuery, ['owner', 'repo']);
        expect(exists).toEqual(true);
    });
    testErrorHandling(() => repository.repositoryExists('owner', 'repo'));
});

describe("GetJobsNotSaved", () => {
    it("should return jobs that are not saved in the database", async () => {
        const commitsWithActions: [string, number][] = [["commit1", 1], ["commit2", 2], ["commit3", 3]];
        const jobsNotSaved: [string, number][] = [["commit1", 1], ["commit2", 2], ["commit3", 3]];

        clientQueryMock.mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const result = await repository.getJobsNotSaved("owner", "repoName", commitsWithActions);

        expect(poolConnectMock).toBeCalledTimes(3);
        expect(clientQueryMock).toHaveBeenNthCalledWith(1, 'SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3', ["owner", "repoName", commitsWithActions[0][1]]);
        expect(clientQueryMock).toHaveBeenNthCalledWith(2, 'SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3', ["owner", "repoName", commitsWithActions[1][1]]);
        expect(clientQueryMock).toHaveBeenNthCalledWith(3, 'SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3', ["owner", "repoName", commitsWithActions[2][1]]);
        expect(result).toEqual(jobsNotSaved);
    });
});

describe("SaveJobsList", () => {
    it("should save a list of jobs", async () => {
        const saveJobSpy = jest.spyOn(repository, 'saveJob');

        await repository.saveJobsList("owner", "repo", jobsFormatted);

        expect(saveJobSpy).toHaveBeenCalledTimes(1);
        expect(saveJobSpy).toHaveBeenNthCalledWith(1, {
            id: 123,
            sha: "abc123",
            owner: "owner",
            reponame: "repo",
            conclusion: "success"
        });
    });
});


