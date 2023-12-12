import { GithubRepository } from "../../../../src/modules/TDDCycles/Repositories/GithubRepository";
import { Octokit } from "octokit";
import { githubCommitData, githubResponseData } from "../../../__mocks__/TDDCycles/dataTypeMocks/githubResponseData";

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
});