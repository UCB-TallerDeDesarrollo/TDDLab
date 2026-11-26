import { Request, Response } from 'express';
import { IGithubRepository } from '../../src/modules/TDDCycles/Domain/IGithubRepository';
import { IDBCommitsRepository } from '../../src/modules/TDDCycles/Domain/IDBCommitsRepository';
import { IDBJobsRepository } from '../../src/modules/TDDCycles/Domain/IDBJobsRepository';
import TDDCyclesController from '../../src/controllers/TDDCycles/TDDCyclesController';
import express from 'express';
import request from 'supertest';
import type { Pool } from 'pg';
import { InMemoryTDDHistoryRepository } from '../../src/modules/TDDCycles/Repositories/InMemoryTDDHistoryRepository';
import type { BranchSyncData } from '../../src/modules/TDDCycles/Application/BranchSyncData';
import {
    mainSyncMock, branchASyncMock, branchBSyncMock, mainAfterMergeSyncMock,
    repositoryMock, commitShas, branchAExecution,
} from '../__mocks__/TDDCycles/dataTypeMocks/BranchSyncMock';

jest.mock('../../src/modules/TDDCycles/Application/getTDDCyclesUseCase');
jest.mock('../../src/modules/TDDCycles/Application/getTestResultsUseCase');
jest.mock('../../src/modules/TDDCycles/Application/getCommitHistoryUseCase');
jest.mock('../../src/modules/TDDCycles/Application/getCommitCyclesUseCase');

describe('BL-04 branch history HTTP with the real BL-02 repository', () => {
    const { GetCommitHistoryUseCase } = jest.requireActual<typeof import('../../src/modules/TDDCycles/Application/getCommitHistoryUseCase')>(
        '../../src/modules/TDDCycles/Application/getCommitHistoryUseCase'
    );
    let repository: InMemoryTDDHistoryRepository;
    let app: express.Express;
    const query = { owner: repositoryMock.owner, repoName: repositoryMock.name };

    async function save(fixture: BranchSyncData) {
        await repository.saveBatch({
            repository: fixture.repository,
            branches: [{ name: fixture.branch.name }],
            commits: fixture.commits,
            branchCommits: fixture.branchCommitShas.map(commitSha => ({ branchName: fixture.branch.name, commitSha })),
            executions: fixture.executions,
        });
    }

    beforeEach(async () => {
        repository = new InMemoryTDDHistoryRepository();
        for (const fixture of [mainSyncMock, branchASyncMock, branchBSyncMock]) await save(fixture);
        const controller = new TDDCyclesController({} as IDBCommitsRepository, {} as IDBJobsRepository, {} as IGithubRepository);
        // Existing controller tests mock this class globally; use the real case here.
        controller.getCommitHistoryUseCase = new GetCommitHistoryUseCase({} as IGithubRepository, repository);
        app = express();
        app.get('/branch-view', (req, res) => controller.getBranchHistory(req, res));
        app.get('/branches', (req, res) => controller.getBranches(req, res));
    });

    it.each([
        ['main', [commitShas.initial], 1],
        ['rama-a', [commitShas.initial, commitShas.branchA], 2],
        ['rama-b', [commitShas.initial, commitShas.branchB], 2],
    ])('queries %s from the repository', async (branch, shas, executionCount) => {
        const response = await request(app).get('/branch-view').query({ ...query, branch }).expect(200);
        expect(response.body.commits.map((commit: { sha: string }) => commit.sha)).toEqual(shas);
        expect(response.body.executions).toHaveLength(executionCount);
        expect(response.body.repository).toEqual(repositoryMock);
    });

    it('reads updated state after merge, preserving identities and original capture', async () => {
        await request(app).get('/branch-view').query({ ...query, branch: 'main' }).expect(200)
            .expect(response => expect(response.body.commits).toHaveLength(1));
        await save(mainAfterMergeSyncMock);
        await save(mainAfterMergeSyncMock);
        const response = await request(app).get('/branch-view').query({ ...query, branch: 'main' }).expect(200);
        expect(response.body.commits).toHaveLength(4);
        expect(response.body.executions).toHaveLength(3);
        expect(response.body.executions).toContainEqual(branchAExecution);
        expect(response.body.commits.find((commit: { sha: string }) => commit.sha === commitShas.merge).metrics).toBeNull();
        const branch = await request(app).get('/branch-view').query({ ...query, branch: 'rama-a' }).expect(200);
        expect(branch.body.commits).toHaveLength(2);
    });

    it('distinguishes a missing branch or repository from a registered empty branch', async () => {
        await request(app).get('/branch-view').query({ ...query, branch: 'missing' }).expect(404);
        await request(app).get('/branch-view').query({ ...query, owner: 'missing', branch: 'main' }).expect(404);
        await repository.saveBatch({ repository: repositoryMock, branches: [{ name: 'feature/login' }], commits: [], executions: [], branchCommits: [] });
        const response = await request(app).get('/branch-view').query({ ...query, branch: 'feature/login' }).expect(200);
        expect(response.body.commits).toEqual([]);
        expect(response.body.executions).toEqual([]);
    });

    it.each([{}, { ...query }, { ...query, branch: '' }, { ...query, branch: ' main ' }, { ...query, branch: ['main', 'rama-a'] }])(
        'rejects invalid query %j', async invalid => {
            await request(app).get('/branch-view').query(invalid).expect(400);
        }
    );

    it('reports repository failures as HTTP 500', async () => {
        jest.spyOn(repository, 'listBranchCommits').mockRejectedValueOnce(new Error('read failed'));
        await request(app).get('/branch-view').query({ ...query, branch: 'main' }).expect(500);
    });

    it('lists registered branches and isolates owners and repository names', async () => {
        const other = { ...repositoryMock, name: 'other' };
        await repository.saveBatch({ repository: other, branches: [{ name: 'only-other' }], commits: [], executions: [], branchCommits: [] });
        const response = await request(app).get('/branches').query(query).expect(200);
        expect(response.body).toEqual({ repository: repositoryMock, branches: ['main', 'rama-a', 'rama-b'] });
        await request(app).get('/branches').query({ ...query, repoName: 'other' }).expect(200)
            .expect(res => expect(res.body.branches).toEqual(['only-other']));
        await request(app).get('/branches').query({ ...query, owner: 'missing' }).expect(404);
        await request(app).get('/branches').query({ ...query, repoName: 'missing' }).expect(404);
    });

    it('returns no branches for an existing repository without branches', async () => {
        await repository.saveBatch({ repository: { ...repositoryMock, name: 'empty' }, branches: [], commits: [], executions: [], branchCommits: [] });
        await request(app).get('/branches').query({ ...query, repoName: 'empty' }).expect(200)
            .expect(res => expect(res.body.branches).toEqual([]));
    });

    it('does not invent commits for unassociated executions', async () => {
        const pending = { ...branchAExecution, eventId: 'pending-event', associatedCommitSha: null, branchAtCapture: 'pending' };
        await repository.saveBatch({ repository: repositoryMock, branches: [{ name: 'pending' }], commits: [], executions: [pending], branchCommits: [] });
        await request(app).get('/branches').query(query).expect(200)
            .expect(res => expect(res.body.branches).toContain('pending'));
        await request(app).get('/branch-view').query({ ...query, branch: 'pending' }).expect(200)
            .expect(res => { expect(res.body.commits).toEqual([]); expect(res.body.executions).toEqual([]); });
        expect(await repository.listExecutions(repositoryMock, { kind: 'captured-in-branch', branchName: 'pending' })).toEqual([pending]);
    });

    it.each(['findRepository', 'listBranches'] as const)('returns a controlled storage error from %s', async method => {
        jest.spyOn(repository, method).mockRejectedValueOnce(new Error('private connection detail'));
        await request(app).get('/branches').query(query).expect(500)
            .expect({ error: 'Server error' });
    });

    it.each([{}, { ...query, owner: ['one', 'two'] }, { ...query, repoName: 'bad/name' }])('rejects invalid branch list query %j', async invalid => {
        await request(app).get('/branches').query(invalid).expect(400);
    });

    it('keeps the legacy GitHub query unchanged', async () => {
        const getCommitHistoryData = jest.fn().mockResolvedValue([]);
        const useCase = new GetCommitHistoryUseCase({ getCommitHistoryData } as unknown as IGithubRepository, repository);
        expect(await useCase.execute('legacy', 'repo')).toEqual([]);
        expect(getCommitHistoryData).toHaveBeenCalledWith('legacy', 'repo');
    });
});

describe('BL-04 router initialization and environment gate', () => {
    const originalEnv = { ...process.env };
    afterEach(() => { process.env = { ...originalEnv }; });

    function loadRouter(getPool: () => Pool = () => { throw new Error('Storage not configured'); }) {
        const app = express();
        // Clear the legacy auto-mock before loading the real router dependencies.
        jest.resetModules();
        jest.isolateModules(() => {
            // Never use developer database credentials in automated tests.
            jest.doMock('../../src/config/tddDb', () => ({ getTddPool: getPool }));
            jest.doMock('../../src/modules/TDDCycles/Application/getCommitHistoryUseCase', () =>
                jest.requireActual('../../src/modules/TDDCycles/Application/getCommitHistoryUseCase'));
            const router = require('../../src/routes/TDDCyclesRoutes').default;
            app.use('/api/TDDCycles', router);
        });
        return app;
    }

    it.each(['development', 'test'])('seeds once and serves concurrent requests in %s', async environment => {
        process.env.NODE_ENV = environment;
        process.env.TDD_HISTORY_MOCK = 'true';
        process.env.TDD_HISTORY_MOCK_SCENARIO = 'initial';
        const app = loadRouter();
        const responses = await Promise.all(['main', 'rama-a', 'rama-b'].map(branch =>
            request(app).get('/api/TDDCycles/branch-view').query({ owner: repositoryMock.owner, repoName: repositoryMock.name, branch }).expect(200)));
        expect(responses.map(response => response.body.commits.length)).toEqual([1, 2, 2]);
    });

    it('serves the independent branches route before branch-view using shared BL-02 state', async () => {
        process.env.NODE_ENV = 'test';
        process.env.TDD_HISTORY_MOCK = 'true';
        process.env.TDD_HISTORY_MOCK_SCENARIO = 'initial';
        const app = loadRouter();
        await request(app).get('/api/TDDCycles/branches')
            .query({ owner: repositoryMock.owner, repoName: repositoryMock.name }).expect(200)
            .expect(res => expect(res.body.branches).toEqual(['main', 'rama-a', 'rama-b']));
        await request(app).get('/api/TDDCycles/branch-view')
            .query({ owner: repositoryMock.owner, repoName: repositoryMock.name, branch: 'main' }).expect(200);
    });

    it('returns 503 for branches when storage is not configured', async () => {
        process.env.TDD_HISTORY_MOCK = 'false';
        await request(loadRouter()).get('/api/TDDCycles/branches').expect(503);
    });

    it('lists PostgreSQL branches with repository-scoped SELECTs only', async () => {
        process.env.TDD_HISTORY_MOCK = 'false';
        const query = jest.fn(async (sql: string, values: unknown[]) => {
            expect(/^\s*SELECT\b/i.test(sql)).toBe(true);
            expect(values).toEqual(['github', repositoryMock.owner, repositoryMock.name]);
            if (sql.includes('SELECT provider')) return { rows: [repositoryMock] };
            if (sql.includes('SELECT name')) return { rows: [{ name: 'feature/dynamic' }] };
            throw new Error('Unexpected SQL');
        });
        await request(loadRouter(() => ({ query } as unknown as Pool))).get('/api/TDDCycles/branches')
            .query({ owner: repositoryMock.owner, repoName: repositoryMock.name }).expect(200)
            .expect(res => expect(res.body.branches).toEqual(['feature/dynamic']));
        expect(query).toHaveBeenCalledTimes(2);
    });

    it('loads the after-merge scenario through saveBatch', async () => {
        process.env.NODE_ENV = 'test';
        process.env.TDD_HISTORY_MOCK = 'true';
        process.env.TDD_HISTORY_MOCK_SCENARIO = 'after-merge';
        const response = await request(loadRouter()).get('/api/TDDCycles/branch-view')
            .query({ owner: repositoryMock.owner, repoName: repositoryMock.name, branch: 'main' }).expect(200);
        expect(response.body.commits).toHaveLength(4);
        expect(response.body.executions).toHaveLength(3);
    });

    it.each([['production', 'true'], ['development', 'false'], ['', 'true']])(
        'disables the mock in NODE_ENV=%s with flag=%s', async (environment, flag) => {
            process.env.NODE_ENV = environment;
            process.env.TDD_HISTORY_MOCK = flag;
            await request(loadRouter()).get('/api/TDDCycles/branch-view').expect(503);
        }
    );

    it('reports invalid seed configuration', async () => {
        process.env.NODE_ENV = 'test';
        process.env.TDD_HISTORY_MOCK = 'true';
        process.env.TDD_HISTORY_MOCK_SCENARIO = 'invalid';
        await request(loadRouter()).get('/api/TDDCycles/branch-view').expect(500);
    });

    it.each(['development', 'production'])('reads through the real PostgreSQL repository in %s', async environment => {
        process.env.NODE_ENV = environment;
        process.env.TDD_HISTORY_MOCK = environment === 'production' ? 'true' : 'false';
        const fixture = branchASyncMock;
        const query = jest.fn(async (sql: string) => {
            if (sql.includes('SELECT provider')) return { rows: [fixture.repository] };
            if (sql.includes('SELECT name')) return { rows: [{ name: 'rama-a' }] };
            if (sql.includes('SELECT c.*')) return { rows: fixture.commits.map(c => ({
                sha: c.sha, parent_shas: c.parentShas, message: c.message,
                committed_at: new Date(c.committedAt!), additions: String(c.stats!.additions),
                deletions: String(c.stats!.deletions), total_changes: String(c.stats!.total), metrics: c.metrics,
            })) };
            if (sql.includes('SELECT e.*')) return { rows: fixture.executions.map(e => ({
                event_id: e.eventId, branch_at_capture: e.branchAtCapture,
                head_sha_at_execution: e.headShaAtExecution, associated_commit_sha: e.associatedCommitSha,
                timestamp_ms: String(e.timestamp), num_passed_tests: String(e.numPassedTests),
                failed_tests: String(e.failedTests), num_total_tests: String(e.numTotalTests),
                coverage_percentage: e.coveragePercentage, success: e.success, test_id: String(e.testId),
            })) };
            throw new Error('Unexpected SQL');
        });
        const pool = { query } as unknown as Pool;
        const response = await request(loadRouter(() => pool)).get('/api/TDDCycles/branch-view')
            .query({ owner: repositoryMock.owner, repoName: repositoryMock.name, branch: 'rama-a' }).expect(200);
        expect(response.body).toEqual({ repository: fixture.repository, branch: 'rama-a', commits: fixture.commits, executions: fixture.executions });
        expect(query).toHaveBeenCalledTimes(4);
        expect(query.mock.calls.every(([sql]) => sql.trimStart().startsWith('SELECT'))).toBe(true);
    });

    it('does not touch PostgreSQL when the development mock is explicitly enabled', async () => {
        process.env.NODE_ENV = 'development';
        process.env.TDD_HISTORY_MOCK = 'true';
        process.env.TDD_HISTORY_MOCK_SCENARIO = 'initial';
        const getPool = jest.fn((): Pool => { throw new Error('Must not access PostgreSQL'); });
        await request(loadRouter(getPool)).get('/api/TDDCycles/branch-view')
            .query({ owner: repositoryMock.owner, repoName: repositoryMock.name, branch: 'main' }).expect(200);
        expect(getPool).not.toHaveBeenCalled();
    });

    it('returns 404 for an absent PostgreSQL repository without mock fallback', async () => {
        process.env.TDD_HISTORY_MOCK = 'false';
        const query = jest.fn().mockResolvedValue({ rows: [] });
        await request(loadRouter(() => ({ query } as unknown as Pool))).get('/api/TDDCycles/branch-view')
            .query({ owner: repositoryMock.owner, repoName: repositoryMock.name, branch: 'main' }).expect(404);
        expect(query).toHaveBeenCalledTimes(1);
    });

    it('returns a controlled error without leaking database error details', async () => {
        process.env.TDD_HISTORY_MOCK = 'false';
        const query = jest.fn().mockRejectedValue(new Error('private database detail'));
        const log = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            const response = await request(loadRouter(() => ({ query } as unknown as Pool))).get('/api/TDDCycles/branch-view')
                .query({ owner: repositoryMock.owner, repoName: repositoryMock.name, branch: 'main' }).expect(500);
            expect(response.body).toEqual({ error: 'Server error' });
            expect(JSON.stringify(log.mock.calls)).not.toContain('private database detail');
        } finally { log.mockRestore(); }
    });
});

describe('TDDCyclesController', () => {
    let controller: TDDCyclesController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockDBCommitsRepository: IDBCommitsRepository;
    let mockDBJobsRepository: IDBJobsRepository;
    let mockGithubRepository: IGithubRepository;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockDBCommitsRepository = {} as IDBCommitsRepository;
        mockDBJobsRepository = {} as IDBJobsRepository;
        mockGithubRepository = {} as IGithubRepository;
        controller = new TDDCyclesController(mockDBCommitsRepository, mockDBJobsRepository, mockGithubRepository);
    });
    // Tests que no se utilizan porque hay que eliminar estos métodos del controlador
    describe('getTDDCycles', () => {
        it('should return 400 if owner or repoName is missing', async () => {
            mockRequest.query = {};
            await controller.getTDDCycles(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Bad request, missing owner or repoName" });
        });
        it('should return 200 and the expected commits if owner and repoName are provided', async () => {
            const expectedCommits = [{ id: 1 }, { id: 2 }];
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            controller.tddCyclesUseCase.execute = jest.fn().mockResolvedValue(expectedCommits);
    
            await controller.getTDDCycles(mockRequest as Request, mockResponse as Response);
    
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedCommits);
            expect(controller.tddCyclesUseCase.execute).toHaveBeenCalledWith('owner', 'repoName');
        });
        it('should return 500 and an error message if an error is thrown', async () => {
            const error = new Error('Server error');
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            controller.tddCyclesUseCase.execute = jest.fn().mockRejectedValue(error);
    
            await controller.getTDDCycles(mockRequest as Request, mockResponse as Response);
    
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Server error' });
        });
    });
    describe('getTestResults', () => {
        it('should return 400 if owner or repoName is missing', async () => {
            mockRequest.query = {};
            await controller.getTestResults(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Bad request, missing owner or repoName" });
        });
        it('should return 200 and the expected test results if owner and repoName are provided', async () => {
            const expectedTestResults = [{ id: 1 }, { id: 2 }];
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            controller.testResultsUseCase.execute = jest.fn().mockResolvedValue(expectedTestResults);
    
            await controller.getTestResults(mockRequest as Request, mockResponse as Response);
    
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedTestResults);
            expect(controller.testResultsUseCase.execute).toHaveBeenCalledWith('owner', 'repoName');
        });
        it('should return 500 and an error message if an error is thrown', async () => {
            const error = new Error('Server error');
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            controller.testResultsUseCase.execute = jest.fn().mockRejectedValue(error);
    
            await controller.getTestResults(mockRequest as Request, mockResponse as Response);
    
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Server error' });
        });
    });

    // Estos tests son para los nuevos endpoints movidos desde la lógica del frontend. Sí se utilizan
    describe('getCommitHistory', () => {
        it('should return 400 if owner or repoName is missing', async () => {
            mockRequest.query = {};
            await controller.getCommitHistory(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Bad request, missing owner or repoName" });
        });

        it('should return 200 and the expected commit history if owner and repoName are provided', async () => {
            const expectedCommits = [{ sha: '1' }, { sha: '2' }];
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            controller.getCommitHistoryUseCase.execute = jest.fn().mockResolvedValue(expectedCommits);

            await controller.getCommitHistory(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedCommits);
            expect(controller.getCommitHistoryUseCase.execute).toHaveBeenCalledWith('owner', 'repoName');
        });

        it('should return 500 and an error message if an error is thrown', async () => {
            const error = new Error('Server error');
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            controller.getCommitHistoryUseCase.execute = jest.fn().mockRejectedValue(error);

            await controller.getCommitHistory(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Server error' });
        });
    });

    describe('getCommitCycles', () => {
        it('should return 400 if owner or repoName is missing', async () => {
            mockRequest.query = {};
            await controller.getCommitCycles(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Bad request, missing owner or repoName" });
        });

        it('should return 200 and the expected commit cycles if owner and repoName are provided', async () => {
            const expectedCycles = [{ sha: 'a', tddCycle: 'Red-Green-Refactor' }];
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            controller.getCommitCyclesUseCase.execute = jest.fn().mockResolvedValue(expectedCycles);

            await controller.getCommitCycles(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedCycles);
            expect(controller.getCommitCyclesUseCase.execute).toHaveBeenCalledWith('owner', 'repoName');
        });

        it('should return 500 and an error message if an error is thrown', async () => {
            const error = new Error('Server error');
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            controller.getCommitCyclesUseCase.execute = jest.fn().mockRejectedValue(error);

            await controller.getCommitCycles(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Server error' });
        });
    });
});
