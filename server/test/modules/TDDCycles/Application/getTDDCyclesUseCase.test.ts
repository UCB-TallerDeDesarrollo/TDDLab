import { GetTDDCyclesUseCase } from "../../../../src/modules/TDDCycles/Application/getTDDCyclesUseCase";
import { IDBCommitsRepository } from "../../../../src/modules/TDDCycles/Domain/IDBCommitsRepository";
import { IGithubRepository } from "../../../../src/modules/TDDCycles/Domain/IGithubRepository";
import { commitsFromGithub, tddCycleDataObjectMock, unsavedCommits } from "../../../__mocks__/TDDCycles/dataTypeMocks/commitData";


jest.mock("../../../../src/modules/TDDCycles/Domain/IDBCommitsRepository", () => {
    return jest.fn().mockImplementation(() => {
        return {
            repositoryExists: jest.fn(),
            getCommits: jest.fn(),
            saveCommitsList: jest.fn(),
            getCommitsNotSaved: jest.fn(),
        };
    });
});
jest.mock("../../../../src/modules/TDDCycles/Domain/IGithubRepository", () => {
    return jest.fn().mockImplementation(() => {
        return {
            getCommits: jest.fn(),
            getCommitsInforForTDDCycle: jest.fn(),
        };
    });
});

describe("GetTDDCyclesUseCase", () => {
    let dbCommitRepository: jest.Mocked<IDBCommitsRepository>;
    let githubRepository: jest.Mocked<IGithubRepository>;
    let useCase: GetTDDCyclesUseCase;

    beforeEach(() => {
        dbCommitRepository = new (require("../../../../src/modules/TDDCycles/Domain/IDBCommitsRepository"))();
        githubRepository = new (require("../../../../src/modules/TDDCycles/Domain/IGithubRepository"))();
        useCase = new GetTDDCyclesUseCase(dbCommitRepository, githubRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch commits from Github, get their info for TDD cycles, save them in the database, and return them when the repository does not exist in the database", async () => {
        const owner = "owner";
        const repoName = "repoName";
        

        dbCommitRepository.repositoryExists.mockResolvedValue(false);
        githubRepository.getCommits.mockResolvedValue(commitsFromGithub);
        githubRepository.getCommitsInforForTDDCycle.mockResolvedValue([tddCycleDataObjectMock]);
        dbCommitRepository.getCommits.mockResolvedValue([tddCycleDataObjectMock]);

        const result = await useCase.execute(owner, repoName);

        expect(dbCommitRepository.repositoryExists).toHaveBeenCalledWith(owner, repoName);
        expect(githubRepository.getCommits).toHaveBeenCalledWith(owner, repoName);
        expect(githubRepository.getCommitsInforForTDDCycle).toHaveBeenCalledWith(owner, repoName, commitsFromGithub);
        expect(dbCommitRepository.saveCommitsList).toHaveBeenCalledWith(owner, repoName, [tddCycleDataObjectMock]);
        expect(dbCommitRepository.getCommits).toHaveBeenCalledWith(owner, repoName);
        expect(result).toEqual([tddCycleDataObjectMock]);
    });

    it("should fetch commits from Github, get their info for TDD cycles, save only the unsaved commits in the database, and return them when the repository exists in the database", async () => {
        const owner = "owner";
        const repoName = "repoName";

        dbCommitRepository.repositoryExists.mockResolvedValue(true);
        githubRepository.getCommits.mockResolvedValue(commitsFromGithub);
        dbCommitRepository.getCommitsNotSaved.mockResolvedValue(unsavedCommits);
        githubRepository.getCommitsInforForTDDCycle.mockResolvedValue([tddCycleDataObjectMock]);
        dbCommitRepository.getCommits.mockResolvedValue([tddCycleDataObjectMock]);

        const result = await useCase.execute(owner, repoName);

        expect(dbCommitRepository.repositoryExists).toHaveBeenCalledWith(owner, repoName);
        expect(githubRepository.getCommits).toHaveBeenCalledWith(owner, repoName);
        expect(dbCommitRepository.getCommitsNotSaved).toHaveBeenCalledWith(owner, repoName, commitsFromGithub);
        expect(githubRepository.getCommitsInforForTDDCycle).toHaveBeenCalledWith(owner, repoName, unsavedCommits);
        expect(dbCommitRepository.saveCommitsList).toHaveBeenCalledWith(owner, repoName, [tddCycleDataObjectMock]);
        expect(dbCommitRepository.getCommits).toHaveBeenCalledWith(owner, repoName);
        expect(result).toEqual([tddCycleDataObjectMock]);
    });

    it("should throw an error when there is an issue with fetching or saving commits", async () => {
        const owner = "owner";
        const repoName = "repoName";

        githubRepository.getCommits.mockRejectedValue(new Error("Error fetching commits"));

        await expect(useCase.execute(owner, repoName)).rejects.toThrow("Error fetching commits");
    });

});