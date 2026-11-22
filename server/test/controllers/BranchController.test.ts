import { Request, Response } from 'express';
import { IGithubRepository } from '../../src/modules/TDDCycles/Domain/IGithubRepository';
import { IBranchRepository } from '../../src/modules/TDDCycles/Domain/IBranchRepository';
import BranchController from '../../src/controllers/TDDCycles/BranchController';

jest.mock('../../src/modules/TDDCycles/Application/GetBranchHistoryUseCase');
jest.mock('../../src/modules/TDDCycles/Application/SaveBranchUseCase');

describe('BranchController', () => {
    let controller: BranchController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockGithubRepository: IGithubRepository;
    let mockBranchRepository: IBranchRepository;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockGithubRepository = {} as IGithubRepository;
        mockBranchRepository = {} as IBranchRepository;
        controller = new BranchController(mockGithubRepository, mockBranchRepository);
    });

    describe('getBranchHistory', () => {
        it('should return 400 if owner, repoName or branch is missing', async () => {
            mockRequest.query = {};
            await controller.getBranchHistory(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });

        it('should return 200 and branch history if all params provided', async () => {
            const expectedHistory = { branch: { name: 'main' }, commits: [] };
            mockRequest.query = { owner: 'owner', repoName: 'repoName', branch: 'main' };
            (controller as any).getBranchHistoryUseCase.execute = jest.fn().mockResolvedValue(expectedHistory);

            await controller.getBranchHistory(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedHistory);
        });

        it('should return 500 if an error is thrown', async () => {
            mockRequest.query = { owner: 'owner', repoName: 'repoName', branch: 'main' };
            (controller as any).getBranchHistoryUseCase.execute = jest.fn().mockRejectedValue(new Error('fail'));

            await controller.getBranchHistory(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
        });
    });

    describe('saveBranch', () => {
        it('should return 400 if required fields are missing', async () => {
            mockRequest.body = {};
            await controller.saveBranch(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });

        it('should return 201 and save branch when valid', async () => {
            mockRequest.body = {
                repository: { slug: 'owner/repoName', remoteUrl: 'https://github.com/owner/repoName' },
                branches: [{ repositorySlug: 'owner/repoName', name: 'main', forkCommitSha: 'sha1', createdAt: '2024-01-01T00:00:00Z' }],
                commits: [{ repositorySlug: 'owner/repoName', commitSha: 'sha1', parentCommitSha: null, branch: 'main', authorName: 'author', message: 'msg', commitedAt: '2024-01-01T00:00:00Z', tddExecutions: [] }],
                merges: [],
            };
            (controller as any).saveBranchUseCase.execute = jest.fn().mockResolvedValue(undefined);

            await controller.saveBranch(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ branchesSaved: 0, commitsSaved: 0, mergesSaved: 0 })
            );
        });

        it('should return 500 if an error is thrown', async () => {
            mockRequest.body = {
                repository: { slug: 'owner/repoName', remoteUrl: 'url' },
                branches: [{ repositorySlug: 'owner/repoName', name: 'main', createdAt: '2024-01-01T00:00:00Z' }],
                commits: [],
                merges: [],
            };
            (controller as any).saveBranchUseCase.execute = jest.fn().mockRejectedValue(new Error('fail'));

            await controller.saveBranch(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getBranches', () => {
        it('should return 400 if owner or repoName is missing', async () => {
            mockRequest.query = {};
            await controller.getBranches(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });

        it('should return default main branch when not new gen', async () => {
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            (controller as any).githubRepository.checkNewGenFile = jest.fn().mockResolvedValue(false);

            await controller.getBranches(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith([
                { name: 'main', repository_slug: 'owner/repoName' },
            ]);
        });
    });

    describe('getMerges', () => {
        it('should return 400 if owner or repoName is missing', async () => {
            mockRequest.query = {};
            await controller.getMerges(mockRequest as Request, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });

        it('should return empty array when not new gen', async () => {
            mockRequest.query = { owner: 'owner', repoName: 'repoName' };
            (controller as any).githubRepository.checkNewGenFile = jest.fn().mockResolvedValue(false);

            await controller.getMerges(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith([]);
        });
    });
});
