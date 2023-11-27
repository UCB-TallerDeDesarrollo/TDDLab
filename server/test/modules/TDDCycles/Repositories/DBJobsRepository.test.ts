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
