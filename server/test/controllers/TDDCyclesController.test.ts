import { Request, Response } from 'express';
import { IGithubRepository } from '../../src/modules/TDDCycles/Domain/IGithubRepository';
import { IDBCommitsRepository } from '../../src/modules/TDDCycles/Domain/IDBCommitsRepository';
import { IDBJobsRepository } from '../../src/modules/TDDCycles/Domain/IDBJobsRepository';
import TDDCyclesController from '../../src/controllers/TDDCycles/TDDCyclesController';

jest.mock('../../src/modules/TDDCycles/Application/getTDDCyclesUseCase');
jest.mock('../../src/modules/TDDCycles/Application/getTestResultsUseCase');

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

    describe('getTDDCycles', () => {
        it('should return 400 if owner or repoName is missing', async () => {
            mockRequest.query = {};
            await controller.getTDDCycles(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Bad request, missing owner or repoName" });
        });
        
    });
});