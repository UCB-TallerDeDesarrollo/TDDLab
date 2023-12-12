import { GithubRepository } from "../../../../src/modules/TDDCycles/Repositories/GithubRepository";
import { Octokit } from "octokit";
import { commitInformationDataObjectMock, commitInformationMock, githubCommitData, githubResponseData, tddCycleDataObject } from "../../../__mocks__/TDDCycles/dataTypeMocks/githubResponseData";
import { commitsFromGithub } from "../../../__mocks__/TDDCycles/dataTypeMocks/commitData";

describe('GithubRepository', () => {
    let githubRepository: GithubRepository;

    beforeEach(() => {
        githubRepository = new GithubRepository();
    });

    describe('getCommits', () => {
        it('should return an array of commits', async () => {
            // Create a mock Octokit instance
            const mockOctokit = {
                request: jest.fn().mockResolvedValueOnce(githubResponseData),
            } as unknown as Octokit;

            // Assign the mock Octokit instance to githubRepository.octokit
            githubRepository.octokit = mockOctokit;

            const owner = 'owner';
            const repoName = 'repoName';

            const commits = await githubRepository.getCommits(owner, repoName);

            expect(commits).toEqual(githubCommitData);
        });

    });
    describe('getCommitInfoForTDDCycle', () => {
        it('should return commit information for a given TDD cycle', async () => {
            // Create a mock Octokit instance
            const mockOctokit = {
                request: jest.fn()
                    .mockResolvedValueOnce({ data: commitInformationDataObjectMock })
                    .mockResolvedValueOnce({ data: [{ body: "Statements | 80% of 100 --- 10 tests passing" }] }),
            } as unknown as Octokit;
            // Assign the mock Octokit instance to githubRepository.octokit
            githubRepository.octokit = mockOctokit;

            const owner = 'owner';
            const repoName = 'repoName';
            const sha = 'commitSha';

            const commitInfo = await githubRepository.getCommitInfoForTDDCycle(owner, repoName, sha);
            expect(commitInfo).toEqual(commitInformationMock);
        });

        it('should throw an error if there is an error obtaining commit information', async () => {
            // Create a mock Octokit instance
            const mockOctokit = {
                request: jest.fn().mockRejectedValueOnce(new Error('Failed to obtain commit information')),
            } as unknown as Octokit;

            // Assign the mock Octokit instance to githubRepository.octokit
            githubRepository.octokit = mockOctokit;

            const owner = 'owner';
            const repoName = 'repoName';
            const sha = 'commitSha';

            await expect(githubRepository.getCommitInfoForTDDCycle(owner, repoName, sha)).rejects.toThrowError(
                'Failed to obtain commit information'
            );
        });
    });

    describe('getCommitsInforForTDDCycle', () => {
        it('should return an array of TDD cycle data for the given commits', async () => {
            // Create a mock Octokit instance
            const mockOctokit = {
                request: jest.fn()
                    .mockResolvedValueOnce({ data: commitInformationDataObjectMock })
                    .mockResolvedValueOnce({ data: [{ body: "Statements | 80% of 100 --- 10 tests passing" }] }),
            } as unknown as Octokit;

            // Assign the mock Octokit instance to githubRepository.octokit
            githubRepository.octokit = mockOctokit;

            const owner = 'owner';
            const repoName = 'repoName';

            const commitsData = await githubRepository.getCommitsInforForTDDCycle(owner, repoName, commitsFromGithub);

            expect(commitsData).toEqual([tddCycleDataObject]);
        });

        it('should throw an error if there is an error obtaining commit information for any commit', async () => {
            // Create a mock Octokit instance
            const mockOctokit = {
                request: jest.fn().mockRejectedValueOnce(new Error('Failed to obtain commit information')),
            } as unknown as Octokit;

            // Assign the mock Octokit instance to githubRepository.octokit
            githubRepository.octokit = mockOctokit;

            const owner = 'owner';
            const repoName = 'repoName';

            await expect(githubRepository.getCommitsInforForTDDCycle(owner, repoName, commitsFromGithub)).rejects.toThrowError(
                'Error getting commits from SHA'
            );
        });
    });

    describe('GithubRepository', () => {
        let githubRepository: GithubRepository;

        beforeEach(() => {
            githubRepository = new GithubRepository();
        });

        describe('timeout', () => {
            it('should reject with an error after the specified timeout', async () => {
                const timeoutMs = 1000;

                await expect(githubRepository.timeout(timeoutMs)).rejects.toThrowError('Request timed out');
            });
        });
    });

    describe('GithubRepository', () => {
        let githubRepository: GithubRepository;

        beforeEach(() => {
            githubRepository = new GithubRepository();
        });

        describe('obtainRunsOfGithubActions', () => {
            it('should return the response from the GitHub API', async () => {
                // Create a mock Octokit instance
                const mockOctokit = {
                    request: jest.fn().mockResolvedValueOnce({ data: 'response' }),
                } as unknown as Octokit;

                // Assign the mock Octokit instance to githubRepository.octokit
                githubRepository.octokit = mockOctokit;

                const owner = 'owner';
                const repoName = 'repoName';

                const response = await githubRepository.obtainRunsOfGithubActions(owner, repoName);

                expect(response).toEqual({ data: 'response' });
            });

            it('should throw an error if there is an error obtaining runs', async () => {
                // Create a mock Octokit instance
                const mockOctokit = {
                    request: jest.fn().mockRejectedValueOnce(new Error('Failed to obtain runs')),
                } as unknown as Octokit;

                // Assign the mock Octokit instance to githubRepository.octokit
                githubRepository.octokit = mockOctokit;

                const owner = 'owner';
                const repoName = 'repoName';

                await expect(githubRepository.obtainRunsOfGithubActions(owner, repoName)).rejects.toThrowError('Failed to obtain runs');
            });
        });
    });
});