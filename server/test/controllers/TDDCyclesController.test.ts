import { Request, Response } from 'express';
import { IGithubRepository } from '../../src/modules/TDDCycles/Domain/IGithubRepository';
import { IDBCommitsRepository } from '../../src/modules/TDDCycles/Domain/IDBCommitsRepository';
import { IDBJobsRepository } from '../../src/modules/TDDCycles/Domain/IDBJobsRepository';
import TDDCyclesController from '../../src/controllers/TDDCycles/TDDCyclesController';
import express from 'express';
import request from 'supertest';
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

    function loadRouter() {
        const app = express();
        // Clear the legacy auto-mock before loading the real router dependencies.
        jest.resetModules();
        jest.isolateModules(() => {
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
