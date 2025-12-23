import { Request, Response } from 'express';
import { IGithubRepository } from '../../src/modules/TDDCycles/Domain/IGithubRepository';
import { IDBCommitsRepository } from '../../src/modules/TDDCycles/Domain/IDBCommitsRepository';
import { IDBJobsRepository } from '../../src/modules/TDDCycles/Domain/IDBJobsRepository';
import TDDCyclesController from '../../src/controllers/TDDCycles/TDDCyclesController';

jest.mock('../../src/modules/TDDCycles/Application/getTDDCyclesUseCase');
jest.mock('../../src/modules/TDDCycles/Application/getTestResultsUseCase');
jest.mock('../../src/modules/TDDCycles/Application/getCommitHistoryUseCase');
jest.mock('../../src/modules/TDDCycles/Application/getCommitCyclesUseCase');

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