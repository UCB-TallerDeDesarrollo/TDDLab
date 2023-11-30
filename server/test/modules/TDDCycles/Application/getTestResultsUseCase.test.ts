import { GetTestResultsUseCase } from "../../../../src/modules/TDDCycles/Application/getTestResultsUseCase";
import { IDBJobsRepository } from "../../../../src/modules/TDDCycles/Domain/IDBJobsRepository";
import { IGithubRepository } from "../../../../src/modules/TDDCycles/Domain/IGithubRepository";
import { githubActionsRunsList, jobsFormatted, jobsToSave, mockJobDataObject } from "../../../__mocks__/TDDCycles/dataTypeMocks/jobData";

jest.mock("../../../../src/modules/TDDCycles/Domain/IDBJobsRepository", () => {
    return jest.fn().mockImplementation(() => {
        return {
            repositoryExists: jest.fn(),
            getJobs: jest.fn(),
            saveJobsList: jest.fn(),
            getJobsNotSaved: jest.fn(),
        };
    });
});
jest.mock("../../../../src/modules/TDDCycles/Domain/IGithubRepository", () => {
    return jest.fn().mockImplementation(() => {
        return {
            getJobs: jest.fn(),
            getJobsInfoForTestResults: jest.fn(),
            getRunsOfGithubActionsIds: jest.fn(),
            getJobsDataFromGithub: jest.fn(),
        };
    });
});

describe("GetTestResultsUseCase", () => {
    let dbJobRepository: jest.Mocked<IDBJobsRepository>;
    let githubRepository: jest.Mocked<IGithubRepository>;
    let useCase: GetTestResultsUseCase;

    beforeEach(() => {
        dbJobRepository = new (require("../../../../src/modules/TDDCycles/Domain/IDBJobsRepository"))();
        githubRepository = new (require("../../../../src/modules/TDDCycles/Domain/IGithubRepository"))();
        useCase = new GetTestResultsUseCase(dbJobRepository, githubRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should correctly initialize GetTestResultsUseCase with provided repositories", () => {
        expect(useCase).toBeInstanceOf(GetTestResultsUseCase);
        expect(useCase['dbJobRepository']).toBe(dbJobRepository);
        expect(useCase['githubRepository']).toBe(githubRepository);
    });

    it("should fetch runs from Github, get their data, save only the unsaved runs in the database, and return them when the repository exists in the database", async () => {

        const owner = "owner";
        const repoName = "repoName";

        githubRepository.getRunsOfGithubActionsIds.mockResolvedValue(githubActionsRunsList);
        dbJobRepository.repositoryExists.mockResolvedValue(true);
        dbJobRepository.getJobsNotSaved.mockResolvedValue(jobsToSave);
        githubRepository.getJobsDataFromGithub.mockResolvedValue(jobsFormatted);
        dbJobRepository.getJobs.mockResolvedValue(mockJobDataObject);

        const result = await useCase.execute(owner, repoName);

        expect(githubRepository.getRunsOfGithubActionsIds).toHaveBeenCalledWith(owner, repoName);
        expect(dbJobRepository.repositoryExists).toHaveBeenCalledWith(owner, repoName);
        expect(dbJobRepository.getJobsNotSaved).toHaveBeenCalledWith(owner, repoName, githubActionsRunsList);
        expect(githubRepository.getJobsDataFromGithub).toHaveBeenCalledWith(owner, repoName, jobsToSave);
        expect(dbJobRepository.saveJobsList).toHaveBeenCalledWith(owner, repoName, jobsFormatted);
        expect(dbJobRepository.getJobs).toHaveBeenCalledWith(owner, repoName);
        expect(result).toEqual(mockJobDataObject);
    });
    it("should throw an error when there is an issue with fetching or saving commits", async () => {
        const owner = "owner";
        const repoName = "repoName";

        githubRepository.getRunsOfGithubActionsIds.mockRejectedValue(new Error("Error fetching jobs"));

        await expect(useCase.execute(owner, repoName)).rejects.toThrow("Error fetching jobs");
    });
});