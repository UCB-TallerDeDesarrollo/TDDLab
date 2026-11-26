import { DBJobsRepository } from '../../../../src/modules/TDDCycles/Repositories/DBJobsRepository';
import { Pool } from "pg";
import { jobsFormatted } from '../../../__mocks__/TDDCycles/dataTypeMocks/jobData';

let jobRepository: DBJobsRepository;
let poolJobConnectMock: jest.Mock;
let clientJobQueryMock: jest.Mock;

function testErrorHandling(methodUnderTest: () => Promise<any>) {
    it("should handle errors", async () => {
        clientJobQueryMock.mockRejectedValue(new Error());
        await expect(methodUnderTest()).rejects.toThrow();
    });
}

beforeEach(() => {
    poolJobConnectMock = jest.fn();
    clientJobQueryMock = jest.fn();
    poolJobConnectMock.mockResolvedValue({
        query: clientJobQueryMock,
        release: jest.fn(),
    });
    jest.spyOn(Pool.prototype, "connect").mockImplementation(poolJobConnectMock);
    jobRepository = new DBJobsRepository();
});

afterEach(() => {
    jest.restoreAllMocks();
});


describe("Save a job", () => {
    it("should save a job", async () => {
        await jobRepository.saveJob({ id: 1, sha: 'sha', owner: 'owner', reponame: 'repo', conclusion: 'success' });
        expect(poolJobConnectMock).toBeCalledTimes(1);
        expect(clientJobQueryMock).toBeCalledWith('INSERT INTO jobsTable (id, sha, owner, repoName, conclusion) VALUES ($1, $2, $3, $4, $5)', [1, 'sha', 'owner', 'repo', 'success']);
    });
    testErrorHandling(() => jobRepository.saveJob({ id: 1, sha: 'sha', owner: 'owner', reponame: 'repo', conclusion: 'success' }));
});

describe("Get jobs", () => {
    it('should get jobs', async () => {
        clientJobQueryMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const jobs = await jobRepository.getJobs('owner', 'repo');
        expect(poolJobConnectMock).toBeCalledTimes(1);
        expect(clientJobQueryMock).toBeCalledWith(
            expect.stringContaining('SELECT id, sha, owner, reponame, conclusion'),
            ['owner', 'repo']
        );
        expect(jobs).toEqual([{ id: 1 }]);
    });
    testErrorHandling(() => jobRepository.getJobs('owner', 'repo'));
});

describe("JobExists", () => {
    it('should check if job exists', async () => {
        clientJobQueryMock.mockResolvedValueOnce({ rows: [{ exists: true }] });
        const exists = await jobRepository.jobExists('owner', 'repo', 1);
        expect(poolJobConnectMock).toBeCalledTimes(1);
        expect(clientJobQueryMock).toBeCalledWith(
            expect.stringContaining('SELECT 1 FROM test_execution execution'),
            ['owner/repo', '1']
        );
        expect(exists).toEqual(true);
    });
    testErrorHandling(() => jobRepository.jobExists('owner', 'repo', 1));
});

describe("RepositoryExists", () => {
    it('should check if job exists', async () => {
        clientJobQueryMock.mockResolvedValueOnce({ rows: [{ count: "1" }] });
        const exists = await jobRepository.repositoryExists('owner', 'repo');
        expect(poolJobConnectMock).toBeCalledTimes(1);
        expect(clientJobQueryMock).toBeCalledWith(
            'SELECT COUNT(*) FROM jobstable WHERE owner = $1 AND reponame = $2',
            ['owner', 'repo']
        );
        expect(exists).toEqual(true);
    });
    testErrorHandling(() => jobRepository.repositoryExists('owner', 'repo'));
});

describe("GetJobsNotSaved", () => {
    it("should return jobs that are not saved in the database", async () => {
        const commitsWithActions: [string, number][] = [["commit1", 1], ["commit2", 2], ["commit3", 3]];
        const jobsNotSaved: [string, number][] = [["commit1", 1], ["commit2", 2], ["commit3", 3]];

        clientJobQueryMock.mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const result = await jobRepository.getJobsNotSaved("owner", "repoName", commitsWithActions);

        expect(poolJobConnectMock).toBeCalledTimes(3);
        expect(clientJobQueryMock).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT 1 FROM test_execution execution'), ["owner/repoName", "1"]);
        expect(clientJobQueryMock).toHaveBeenNthCalledWith(2, expect.stringContaining('SELECT 1 FROM test_execution execution'), ["owner/repoName", "2"]);
        expect(clientJobQueryMock).toHaveBeenNthCalledWith(3, expect.stringContaining('SELECT 1 FROM test_execution execution'), ["owner/repoName", "3"]);
        expect(result).toEqual(jobsNotSaved);
    });
    it("should stop checking for jobs if a job already exists", async () => {
        const commitsWithActions: [string, number][] = [["commit1", 1], ["commit2", 2], ["commit3", 3]];
        const jobsNotSaved: [string, number][] = [];

        // Mock the jobExists method to return true for the first job
        jest.spyOn(jobRepository, "jobExists")
            .mockResolvedValueOnce(true);

        const result = await jobRepository.getJobsNotSaved("owner", "repoName", commitsWithActions);

        expect(result).toEqual(jobsNotSaved);
    });
});

describe("SaveJobsList", () => {
    it("should save a list of jobs", async () => {
        clientJobQueryMock
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ rows: [{ id: 'project-id' }] })
            .mockResolvedValueOnce({ rows: [{ id: 'repository-id' }] })
            .mockResolvedValueOnce({ rows: [{ id: 'commit-id' }] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});

        await jobRepository.saveJobsList("owner", "repo", jobsFormatted);

        expect(clientJobQueryMock).toHaveBeenNthCalledWith(1, "BEGIN");
        expect(clientJobQueryMock).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO project"), ["owner"]);
        expect(clientJobQueryMock).toHaveBeenNthCalledWith(3, expect.stringContaining("INSERT INTO repository"), ["project-id", "owner/repo"]);
        expect(clientJobQueryMock).toHaveBeenNthCalledWith(4, expect.stringContaining('INSERT INTO "commit"'), ["repository-id", "abc123"]);
        expect(clientJobQueryMock).toHaveBeenNthCalledWith(5, expect.stringContaining("INSERT INTO test_execution"), ["repository-id", "commit-id", 1, 0, 1, true]);
        expect(clientJobQueryMock).toHaveBeenNthCalledWith(6, "COMMIT");
    });
});


